import serial
import time

ser = serial.Serial(
    port="COM6",
    baudrate=9600,
    timeout=1,
    write_timeout=2,
    rtscts=False,
    dsrdtr=False,
    xonxoff=False,
)

print("Opening COM3...")
print("Connected:", ser.is_open)

data = bytes.fromhex("00 FF 00 FF")

print("About to write...")
start = time.time()

try:
    written = ser.write(data)
    elapsed = time.time() - start

    print(f"write() returned after {elapsed:.2f}s")
    print(f"Written: {written} bytes")
    print(f"Data: {data.hex(' ')}")

except serial.SerialTimeoutException:
    print("WRITE TIMEOUT")

except Exception as e:
    print("ERROR:", repr(e))

finally:
    ser.close()
    print("Closed")