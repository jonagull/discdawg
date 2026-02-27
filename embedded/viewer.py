import serial
import threading
import re
from vpython import box, vector, rate, scene
import sys, glob

# -------- SERIAL --------
# PORT = "/dev/cu.usbmodem1101"  # change if needed
PORT = sys.argv[1] if len(sys.argv) > 1 else None
if PORT is None:
    ports = glob.glob("/dev/cu.usbmodem*") + glob.glob("/dev/tty.usbmodem*")
    PORT = ports[0] if ports else None
print("Using port:", PORT)
BAUD = 115200

roll = 0
pitch = 0
yaw = 0

def serial_thread():
    global roll, pitch, yaw
    with serial.Serial(PORT, BAUD, timeout=1) as ser:
        while True:
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            m = re.match(r"(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*)", line)
            if m:
                roll = float(m.group(1))
                pitch = float(m.group(2))
                yaw = float(m.group(3))

t = threading.Thread(target=serial_thread, daemon=True)
t.start()

# -------- 3D SCENE --------
scene.title = "Pico BNO085 3D Viewer"
cube = box(length=0.3, height=0.3, width=2)
from math import pi
cube.rotate(angle=pi/2, axis=vector(1,0,0))

while True:
    rate(60)

    # Convert degrees to radians
    from math import radians, cos, sin

    r = radians(roll)
    p = radians(pitch)
    y = radians(yaw)

    # Simple orientation mapping
    cube.axis = vector(cos(y)*cos(p), sin(p), sin(y)*cos(p))
    cube.up = vector(
        -cos(y)*sin(p)*sin(r) - sin(y)*cos(r),
        cos(p)*sin(r),
        -sin(y)*sin(p)*sin(r) + cos(y)*cos(r)
    )
