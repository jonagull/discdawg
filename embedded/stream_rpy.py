from machine import I2C, Pin
from utime import sleep_ms
from bno08x import *

i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000, timeout=200_000)
bno = BNO08X(i2c, debug=False)

bno.enable_feature(BNO_REPORT_GAME_ROTATION_VECTOR, 50)
bno.set_quaternion_euler_vector(BNO_REPORT_GAME_ROTATION_VECTOR)

print("r,p,y")  # header once

while True:
    r, p, y = bno.euler
    # simple CSV line: roll,pitch,yaw
    print("{:.2f},{:.2f},{:.2f}".format(r, p, y))
    sleep_ms(20)  # ~50 Hz
