from machine import I2C, Pin
from utime import sleep_ms
import math
from bno08x import *

# Pico wiring: GP0=SDA, GP1=SCL  (I2C0)
i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000, timeout=200_000)

bno = BNO08X(i2c, debug=False)
print("BNO085 connected. Streaming... (Ctrl+C to stop)\n")

# Enable only what we display (keep it simple + stable)
bno.enable_feature(BNO_REPORT_ACCELEROMETER, 20)          # 20 Hz
bno.enable_feature(BNO_REPORT_GYROSCOPE, 20)              # 20 Hz
bno.enable_feature(BNO_REPORT_GAME_ROTATION_VECTOR, 10)   # 10 Hz (yaw drifts, but smooth)
bno.set_quaternion_euler_vector(BNO_REPORT_GAME_ROTATION_VECTOR)

# Header (printed once)
print("   Roll    Pitch     Yaw |  Accel(g) |   Gyro(deg/s) X    Y    Z")

while True:
    # Orientation (degrees)
    roll, pitch, yaw = bno.euler

    # Accel (m/s^2) -> magnitude in g
    ax, ay, az = bno.acc
    accel_g = math.sqrt(ax*ax + ay*ay + az*az) / 9.80665

    # Gyro (rad/s) -> deg/s
    gx, gy, gz = bno.gyro
    gx_d, gy_d, gz_d = gx * 57.2958, gy * 57.2958, gz * 57.2958

    # One-line live dashboard (no scrolling)
    line = (
        f"\r{roll:7.1f} {pitch:8.1f} {yaw:8.1f} |"
        f"   {accel_g:7.3f} |"
        f" {gx_d:8.1f} {gy_d:6.1f} {gz_d:6.1f}   "
    )
    print(line, end="")

    sleep_ms(100)  # ~10 updates/second
