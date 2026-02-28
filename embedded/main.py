from machine import Pin, I2C
import time
import json
import os
import math
import struct
import ubinascii
import bluetooth
import bno08x


# -----------------------------
# IMU + flight logging settings
# -----------------------------
FLIGHT_FILE = "flight.json"
THROW_THRESHOLD = 25
LAND_THRESHOLD = 2
LAND_TIMEOUT = 3
SAMPLE_RATE = 50
SAMPLE_INTERVAL = 1.0 / SAMPLE_RATE


# -----------------------------
# BLE protocol settings
# -----------------------------
SERVICE_UUID = bluetooth.UUID("00001234-0000-1000-8000-00805f9b34fb")
DATA_UUID = bluetooth.UUID("00001235-0000-1000-8000-00805f9b34fb")
STATUS_UUID = bluetooth.UUID("00001236-0000-1000-8000-00805f9b34fb")
CONTROL_UUID = bluetooth.UUID("00001237-0000-1000-8000-00805f9b34fb")
MONITOR_UUID = bluetooth.UUID("00001238-0000-1000-8000-00805f9b34fb")

_IRQ_CENTRAL_CONNECT = 1
_IRQ_CENTRAL_DISCONNECT = 2
_IRQ_GATTS_WRITE = 3

CHUNK_SIZE = 12  # tiny chunk to remain stable across low MTU connections


def advertising_payload(name="DiscDawg"):
    payload = bytearray(b"\x02\x01\x06")
    name_bytes = name.encode()
    payload += struct.pack("BB", len(name_bytes) + 1, 0x09) + name_bytes
    return payload


class FlightBLEServer:
    def __init__(self, on_clear=None, on_mock=None):
        self.ble = bluetooth.BLE()
        self.ble.active(True)
        self.ble.irq(self._irq)

        self.connections = set()
        self.flight_payload = b""
        self.transfer_chunks = []
        self.transfer_index = -1
        self.on_clear = on_clear
        self.on_mock = on_mock

        service_def = (
            SERVICE_UUID,
            (
                (DATA_UUID, bluetooth.FLAG_READ),
                (STATUS_UUID, bluetooth.FLAG_READ | bluetooth.FLAG_NOTIFY),
                (CONTROL_UUID, bluetooth.FLAG_WRITE),
                (MONITOR_UUID, bluetooth.FLAG_READ | bluetooth.FLAG_NOTIFY),
            ),
        )
        ((self.data_handle, self.status_handle, self.control_handle, self.monitor_handle),) = self.ble.gatts_register_services((service_def,))

        self._set_data("NO_DATA")
        self._set_status("IDLE")
        self._set_monitor("0,0,0,0,0,0,0")

        self.ble.gap_advertise(100_000, advertising_payload("DiscDawg"))
        print("BLE advertising as DiscDawg")

    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            self.connections.add(conn_handle)
            print("BLE connected")
        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            if conn_handle in self.connections:
                self.connections.remove(conn_handle)
            self.ble.gap_advertise(100_000, advertising_payload("DiscDawg"))
            print("BLE disconnected; advertising restarted")
        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            if value_handle == self.control_handle:
                raw = self.ble.gatts_read(self.control_handle)
                command = raw.decode().strip().upper() if raw else ""
                print("BLE control write from {}: {}".format(conn_handle, command))
                self._handle_command(command, conn_handle)

    def _set_status(self, text):
        payload = text.encode()
        self.ble.gatts_write(self.status_handle, payload)
        for conn_handle in self.connections:
            try:
                self.ble.gatts_notify(conn_handle, self.status_handle)
            except Exception:
                pass

    def _set_data(self, text):
        self.ble.gatts_write(self.data_handle, text.encode())

    def _set_monitor(self, text):
        payload = text.encode()
        self.ble.gatts_write(self.monitor_handle, payload)
        for conn_handle in self.connections:
            try:
                self.ble.gatts_notify(conn_handle, self.monitor_handle)
            except Exception:
                pass

    def set_flight_payload(self, payload_bytes):
        self.flight_payload = payload_bytes
        if len(payload_bytes) == 0:
            self._set_data("NO_DATA")
            self._set_status("IDLE")
            print("BLE payload set: no flight data")
            return

        self.transfer_chunks = [payload_bytes[i : i + CHUNK_SIZE] for i in range(0, len(payload_bytes), CHUNK_SIZE)]
        self.transfer_index = -1
        self._set_data("READY")
        self._set_status("READY:{}/{}".format(0, len(self.transfer_chunks)))
        print("BLE payload set: {} bytes, {} chunks".format(len(payload_bytes), len(self.transfer_chunks)))

    def clear_flight_payload(self):
        self.flight_payload = b""
        self.transfer_chunks = []
        self.transfer_index = -1
        self._set_data("NO_DATA")
        self._set_status("IDLE")

    def _handle_command(self, command, conn_handle=None):
        if command == "START":
            if not self.transfer_chunks:
                self._set_data("NO_DATA")
                self._set_status("IDLE")
                print("BLE START requested but no data")
                return
            self.transfer_index = 0
            self._emit_current_chunk()
            print("BLE transfer started for conn {}".format(conn_handle))
            return

        if command == "NEXT":
            if not self.transfer_chunks:
                self._set_data("NO_DATA")
                self._set_status("IDLE")
                return

            if self.transfer_index < 0:
                self.transfer_index = 0
                self._emit_current_chunk()
                return

            self.transfer_index += 1
            if self.transfer_index >= len(self.transfer_chunks):
                self._set_data("EOF")
                self._set_status("DONE")
                print("BLE transfer done for conn {}".format(conn_handle))
            else:
                self._emit_current_chunk()
            return

        if command == "CLEAR":
            if self.on_clear:
                self.on_clear()
            self.clear_flight_payload()
            print("BLE CLEAR requested; flight file removed")
            return

        if command == "MOCK":
            if self.on_mock:
                payload = self.on_mock()
                self.set_flight_payload(payload)
                print("BLE MOCK requested; generated mock flight")
                return
            self._set_status("ERROR")
            print("BLE MOCK requested but no callback")
            return

        self._set_status("ERROR")

    def _emit_current_chunk(self):
        chunk = self.transfer_chunks[self.transfer_index]
        chunk_b64 = ubinascii.b2a_base64(chunk).decode().strip()
        self._set_data(chunk_b64)
        self._set_status("XFER:{}/{}".format(self.transfer_index + 1, len(self.transfer_chunks)))
        print("BLE chunk {}/{}".format(self.transfer_index + 1, len(self.transfer_chunks)))


def save_flight(samples):
    with open(FLIGHT_FILE, "w") as f:
        json.dump(samples, f)
    print("Saved {} samples to {}".format(len(samples), FLIGHT_FILE))


def read_flight_bytes():
    try:
        with open(FLIGHT_FILE, "rb") as f:
            data = f.read()
            print("Read {} bytes from {}".format(len(data), FLIGHT_FILE))
            return data
    except Exception as exc:
        print("Read flight failed: {}".format(exc))
        return b""


def clear_flight_file():
    try:
        os.remove(FLIGHT_FILE)
    except Exception:
        pass


def generate_mock_samples(duration_ms=6500, sample_rate=50):
    step_ms = int(1000 / sample_rate)
    samples = []

    for t in range(0, duration_ms, step_ms):
        phase = t / float(duration_ms)
        roll = 18 * math.sin(phase * 3.5 * math.pi) + 10 * (1 - phase)
        pitch = -7 + 16 * math.sin(phase * 2.2 * math.pi)
        yaw = 380 * phase + 45 * math.sin(phase * 8.0)
        samples.append({"t": t, "r": round(roll, 2), "p": round(pitch, 2), "y": round(yaw, 2)})

    return samples


def generate_mock_flight_payload():
    samples = generate_mock_samples(duration_ms=6500, sample_rate=SAMPLE_RATE)
    payload = json.dumps(samples).encode()
    save_flight(samples)
    print("Generated mock flight: {} samples, {} bytes".format(len(samples), len(payload)))
    return payload


# -----------------------------
# Initialize IMU
# -----------------------------
i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000)
print("Initializing BNO085...")
try:
    bno = bno08x.BNO08X(i2c, debug=False)
except TypeError:
    bno = bno08x.BNO08X(i2c)


def enable_report(report_name, rate_hz=50):
    report = getattr(bno08x, report_name, None)
    if report is None:
        return False
    try:
        bno.enable_feature(report, rate_hz)
        print("Enabled {} @ {}Hz".format(report_name, rate_hz))
        return True
    except TypeError:
        try:
            bno.enable_feature(report)
            print("Enabled {}".format(report_name))
            return True
        except Exception as exc:
            print("Failed to enable {}: {}".format(report_name, exc))
            return False
    except Exception as exc:
        print("Failed to enable {}: {}".format(report_name, exc))
        return False


rotation_enabled = (
    enable_report("BNO_REPORT_GAME_ROTATION_VECTOR", SAMPLE_RATE)
    or enable_report("BNO_REPORT_ROTATION_VECTOR", SAMPLE_RATE)
)

if hasattr(bno, "set_quaternion_euler_vector") and hasattr(bno08x, "BNO_REPORT_GAME_ROTATION_VECTOR"):
    try:
        bno.set_quaternion_euler_vector(bno08x.BNO_REPORT_GAME_ROTATION_VECTOR)
        print("Configured quaternion -> euler vector")
    except Exception as exc:
        print("Quaternion/euler config warning: {}".format(exc))

accel_report_enabled = (
    enable_report("BNO_REPORT_ACCELEROMETER", SAMPLE_RATE)
    or enable_report("BNO_REPORT_LINEAR_ACCELERATION", SAMPLE_RATE)
)


def resolve_accel_reader(sensor):
    candidates = [
        "accel",
        "acceleration",
        "linear_acceleration",
        "raw_acceleration",
    ]
    for name in candidates:
        try:
            value = getattr(sensor, name)
            if isinstance(value, (tuple, list)) and len(value) >= 3:
                print("Using accel source: {}".format(name))
                return lambda n=name: getattr(sensor, n)
        except Exception:
            pass

    print("WARNING: No accel field found on BNO08X object.")
    print("Tried accel fields: {}".format(candidates))
    return None


accel_reader = resolve_accel_reader(bno)

print("Waiting for first orientation sample...")
wait_started = time.ticks_ms()
orientation_ready = False
while True:
    try:
        _ = bno.euler
        orientation_ready = True
        break
    except RuntimeError:
        if time.ticks_diff(time.ticks_ms(), wait_started) > 8000:
            print("WARNING: Orientation sample timeout. Continuing; check IMU wiring/power.")
            break
        time.sleep(0.05)


# -----------------------------
# Initialize BLE
# -----------------------------
ble_server = FlightBLEServer(on_clear=clear_flight_file, on_mock=generate_mock_flight_payload)
existing_payload = read_flight_bytes()
ble_server.set_flight_payload(existing_payload)


# -----------------------------
# Main loop
# -----------------------------
state = "idle"
samples = []
start_time = 0
last_land_time = None

led = Pin("LED", Pin.OUT)

print("Ready! Throw disc to start logging.")
print("Start threshold={} Stop threshold={} Stop timeout={}s".format(THROW_THRESHOLD, LAND_THRESHOLD, LAND_TIMEOUT))
if not accel_reader:
    print("WARNING: Motion-triggered throw logging disabled (no accel source).")
    print("Live monitor + BLE transfer still available.")

while True:
    if accel_reader:
        try:
            accel = accel_reader()
        except Exception:
            accel = (0.0, 0.0, 0.0)
    else:
        accel = (0.0, 0.0, 0.0)

    if not isinstance(accel, (tuple, list)) or len(accel) < 3:
        accel = (0.0, 0.0, 0.0)

    accel_magnitude = (accel[0] ** 2 + accel[1] ** 2 + accel[2] ** 2) ** 0.5

    try:
        r, p, y = bno.euler
    except Exception:
        r, p, y = 0, 0, 0

    monitor_line = "{:.2f},{:.2f},{:.2f},{:.2f},{:.2f},{:.2f},{:.2f}".format(
        r,
        p,
        y,
        accel[0],
        accel[1],
        accel[2],
        accel_magnitude,
    )
    ble_server._set_monitor(monitor_line)

    if state == "idle":
        if accel_reader and accel_magnitude > THROW_THRESHOLD:
            state = "logging"
            samples = []
            start_time = time.ticks_ms()
            last_land_time = None
            led.on()
            print("Flight started")

    elif state == "logging":
        elapsed_ms = time.ticks_diff(time.ticks_ms(), start_time)
        samples.append(
            {
                "t": int(elapsed_ms),
                "r": round(r, 2),
                "p": round(p, 2),
                "y": round(y, 2),
            }
        )

        if accel_magnitude < LAND_THRESHOLD:
            if last_land_time is None:
                last_land_time = time.ticks_ms()
            elif time.ticks_diff(time.ticks_ms(), last_land_time) > LAND_TIMEOUT * 1000:
                state = "idle"
                led.off()
                print("Flight ended: {} samples, {:.1f}s".format(len(samples), elapsed_ms / 1000.0))
                save_flight(samples)
                ble_server.set_flight_payload(read_flight_bytes())
        else:
            last_land_time = None

    time.sleep(SAMPLE_INTERVAL)
