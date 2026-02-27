from machine import Pin, I2C
import time

led = Pin("LED", Pin.OUT)
i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=100_000)
print([hex(x) for x in i2c.scan()])

while True:
    led.toggle()
    time.sleep(0.1)
