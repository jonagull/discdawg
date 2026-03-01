# DiscDawg Pico firmware

## Run from this directory

**Important:** Always `cd` into `embedded` before copying or running. If you run from your home folder, the wrong `main.py` gets copied to the Pico and the app will not find DiscDawg.

```bash
cd /path/to/discdawg/embedded

# Copy this repo's main.py to the Pico
mpremote fs cp main.py :main.py

# Run it (you should see "DiscDawg main.py starting..." and "BLE advertising as DiscDawg" in the terminal)
mpremote run main.py
```

If you see those messages, the Pico is advertising. Then on the phone: allow Bluetooth for the app (Settings > DiscDawg > Bluetooth), ensure system Bluetooth is On, and try scanning again.

## Serial logs

- With `mpremote run main.py`, startup logs and the 10s BLE heartbeat appear in the same terminal.
- Or connect a serial terminal at **115200 baud** to the Pico's USB port and reset the Pico (with `main.py` as the boot script or run it from REPL).
