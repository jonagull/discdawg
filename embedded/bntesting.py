from machine import Pin, I2C
import time
import bno08x

# I2C setup (GP0 = SDA, GP1 = SCL)
i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000)

print("Initializing BNO085...")

bno = bno08x.BNO08x(i2c)

# Enable rotation vector (gives orientation)
bno.enable_feature(bno08x.BNO_REPORT_ROTATION_VECTOR)

print("Sensor ready!")

while True:
    roll, pitch, yaw = bno.euler
    print("Roll: {:.2f}  Pitch: {:.2f}  Yaw: {:.2f}".format(
        roll, pitch, yaw
    ))
    time.sleep(0.2)
