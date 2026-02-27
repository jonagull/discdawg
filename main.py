# from machine import Pin
# import time
#
# led = Pin("LED", Pin.OUT)
#
# while True:
#     led.toggle()
#     time.sleep(0.1)
#
from machine import Pin, I2C
import time
import bno08x

i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000)

print("Initializing BNO085...")
bno = bno08x.BNO08X(i2c)

# Enable *only* rotation vector first (most widely supported)
bno.enable_feature(bno08x.BNO_REPORT_ROTATION_VECTOR)

print("Waiting for orientation data...")

# Wait until the driver has a quaternion report available
while True:
    try:
        r, p, y = bno.euler
        break
    except RuntimeError:
        time.sleep(0.05)

print("Ready! Move/tilt the sensor!")

while True:
    r, p, y = bno.euler
    print("Roll: {:.2f}  Pitch: {:.2f}  Yaw: {:.2f}".format(r, p, y))
    time.sleep(0.1)
