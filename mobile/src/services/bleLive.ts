import { Buffer } from "buffer";
import { FlightSample } from "../types";

const SERVICE_UUID = "00001234-0000-1000-8000-00805f9b34fb";
const DATA_UUID = "00001235-0000-1000-8000-00805f9b34fb";
const STATUS_UUID = "00001236-0000-1000-8000-00805f9b34fb";
const CONTROL_UUID = "00001237-0000-1000-8000-00805f9b34fb";
const MONITOR_UUID = "00001238-0000-1000-8000-00805f9b34fb";

type BleModule = typeof import("react-native-ble-plx");

let bleModule: BleModule | null = null;
let bleManager: InstanceType<BleModule["BleManager"]> | null = null;

async function getBleManager() {
    if (!bleModule) {
        bleModule = await import("react-native-ble-plx");
    }

    if (!bleManager) {
        bleManager = new bleModule.BleManager();
    }

    return { manager: bleManager, module: bleModule };
}

function decodeBleUtf8(value?: string | null) {
    if (!value) return "";
    return Buffer.from(value, "base64").toString("utf8");
}

function encodeUtf8(value: string) {
    return Buffer.from(value, "utf8").toString("base64");
}

export async function scanForDisc(timeoutMs = 20000) {
    const { manager } = await getBleManager();

    const timeoutSec = Math.round(timeoutMs / 1000);
    try {
        const state = await manager.state();
        console.log("[BLE scan] Adapter state:", state);
        if (state === "Unknown") {
            console.log(
                "[BLE scan] Bluetooth is 'Unknown' – grant the app Bluetooth permission in Settings (Settings > DiscDawg > Bluetooth), then restart the app. On first launch, allow when prompted.",
            );
        }
        if (state !== "PoweredOn") {
            console.log("[BLE scan] Bluetooth is not PoweredOn. Turn on Bluetooth in system Settings and try again.");
        }
    } catch (e) {
        console.log("[BLE scan] Could not get adapter state:", (e as Error)?.message);
    }
    console.log("[BLE scan] Starting scan for DiscDawg (timeout " + timeoutSec + "s)...");

    return new Promise<any>((resolve, reject) => {
        let settled = false;
        const devicesSeen = new Map<string, string>(); // id -> name for timeout log

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            manager.stopDeviceScan();
            const names = Array.from(devicesSeen.entries())
                .map(([id, name]) => name || id)
                .slice(0, 20);
            console.log(
                "[BLE scan] Timeout after " + timeoutSec + "s. No device named 'DiscDawg' found. Devices seen (" + devicesSeen.size + "):",
                names.length ? names.join(", ") : "(none)",
            );
            reject(
                new Error(
                    "Timed out scanning for DiscDawg. Make sure Pico is powered and advertising.",
                ),
            );
        }, timeoutMs);

        // Scan without service UUID filter because Pico advertising may only include local name.
        manager.startDeviceScan(
            null,
            { allowDuplicates: false },
            (error, device) => {
                if (settled) return;

                if (error) {
                    settled = true;
                    clearTimeout(timeoutId);
                    manager.stopDeviceScan();
                    console.log("[BLE scan] Error:", error?.message ?? error);
                    reject(error);
                    return;
                }

                const name = device?.name ?? device?.localName ?? "";
                if (device) {
                    devicesSeen.set(device.id, name || "(no-name)");
                    console.log("[BLE scan] device:", device.id, name || "(no-name)");
                }
                if (device && name.includes("DiscDawg")) {
                    settled = true;
                    clearTimeout(timeoutId);
                    manager.stopDeviceScan();
                    console.log("[BLE scan] Matched DiscDawg:", device.id, name);
                    resolve(device);
                }
            },
        );
    });
}

export async function connectToDisc(deviceId: string) {
    const { manager } = await getBleManager();
    console.log("[BLE connect] connecting to", deviceId);
    const device = await manager.connectToDevice(deviceId, { timeout: 12000 });
    await device.discoverAllServicesAndCharacteristics();
    console.log("[BLE connect] connected + discovered", device.id);
    return device;
}

async function writeControl(device: any, command: string) {
    return device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CONTROL_UUID,
        encodeUtf8(command),
    );
}

async function readStatus(device: any) {
    const result = await device.readCharacteristicForService(
        SERVICE_UUID,
        STATUS_UUID,
    );
    return decodeBleUtf8(result.value);
}

async function readData(device: any) {
    const result = await device.readCharacteristicForService(
        SERVICE_UUID,
        DATA_UUID,
    );
    return decodeBleUtf8(result.value);
}

export async function downloadFlightFromDisc(
    device: any,
    onProgress?: (receivedChunks: number, totalChunks?: number) => void,
) {
    const initialStatus = await readStatus(device);
    console.log("[BLE transfer] initial status:", initialStatus);
    if (initialStatus.startsWith("IDLE")) {
        throw new Error(
            'Disc has no flight data yet (status IDLE). Throw first, or use "Generate Mock On Pico + Download".',
        );
    }

    await writeControl(device, "START");

    const chunks: Buffer[] = [];
    let totalChunks = 0;

    for (let guard = 0; guard < 10000; guard += 1) {
        const status = await readStatus(device);
        console.log("[BLE transfer] status:", status);
        const transferMatch = status.match(/(READY|XFER):(\d+)\/(\d+)/);
        if (transferMatch) {
            totalChunks = Number(transferMatch[3]);
        }

        const packet = await readData(device);
        if (!packet) {
            await writeControl(device, "NEXT");
            continue;
        }

        if (packet === "EOF") {
            console.log("[BLE transfer] EOF");
            break;
        }

        if (packet === "NO_DATA") {
            throw new Error("Disc reported no flight data.");
        }

        chunks.push(Buffer.from(packet, "base64"));
        onProgress?.(chunks.length, totalChunks || undefined);
        console.log("[BLE transfer] chunk", chunks.length, totalChunks || "?");
        await writeControl(device, "NEXT");
    }

    if (chunks.length === 0) {
        throw new Error("No data chunks received from disc.");
    }

    const payload = Buffer.concat(chunks).toString("utf8");
    const samples = JSON.parse(payload) as FlightSample[];

    if (!Array.isArray(samples) || samples.length === 0) {
        throw new Error("Downloaded payload was empty or invalid.");
    }

    return samples;
}

export async function clearDiscFlight(device: any) {
    await writeControl(device, "CLEAR");
}

export async function generateMockFlightOnDisc(device: any) {
    console.log("[BLE transfer] requesting MOCK flight generation");
    await writeControl(device, "MOCK");
}

export async function disconnectFromDisc(device: any) {
    try {
        await device.cancelConnection();
    } catch {
        // ignore disconnect race
    }
}

export interface RealtimeSample {
    roll: number;
    pitch: number;
    yaw: number;
    ax: number;
    ay: number;
    az: number;
    amag: number;
}

export async function readRealtimeSample(
    device: any,
): Promise<RealtimeSample | null> {
    const result = await device.readCharacteristicForService(
        SERVICE_UUID,
        MONITOR_UUID,
    );
    const line = decodeBleUtf8(result.value);
    if (!line) return null;

    const parts = line.split(",").map((v) => Number(v));
    if (parts.length < 7 || parts.some((v) => Number.isNaN(v))) {
        return null;
    }

    return {
        roll: parts[0],
        pitch: parts[1],
        yaw: parts[2],
        ax: parts[3],
        ay: parts[4],
        az: parts[5],
        amag: parts[6],
    };
}
