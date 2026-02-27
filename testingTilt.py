from machine import Pin, I2C
import time
import bno08x

i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000)

print("Initializing BNO085...")
bno = bno08x.BNO08X(i2c)
bno.enable_feature(bno08x.BNO_REPORT_ROTATION_VECTOR)

print("Streaming quaternions (qx,qy,qz,qw)... Ctrl+C to stop")
while True:
    # Many versions expose .quat; if yours doesn't, you'll get an AttributeError
    qx, qy, qz, qw = bno.quat
    print(qx, qy, qz, qw)
    time.sleep(0.05)
