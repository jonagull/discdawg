from machine import Pin, I2C
import time

i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000)

while True:
    print([hex(x) for x in i2c.scan()])
    time.sleep(1)
