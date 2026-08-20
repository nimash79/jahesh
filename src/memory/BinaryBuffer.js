export default class BinaryBuffer {
  constructor(sizeOrBytes) {
    if (sizeOrBytes instanceof Uint8Array) {
      this.bytes = new Uint8Array(sizeOrBytes);
    } else if (typeof sizeOrBytes === 'number') {
      this.bytes = new Uint8Array(sizeOrBytes);
    } else {
      throw new Error('Invalid buffer constructor.');
    }
  }

  get length() {
    return this.bytes.length;
  }

  clone() {
    return new Uint8Array(this.bytes);
  }

  load(bytes) {
    if (bytes.length !== this.length) throw new Error('Invalid buffer size.');

    this.bytes.set(bytes);
  }

  clear() {
    this.bytes.fill(0);
  }

  //------------------------------------------
  // 8 bit
  //------------------------------------------

  getUint8(offset) {
    return this.bytes[offset];
  }

  setUint8(offset, value) {
    this.bytes[offset] = value & 0xff;
  }

  //------------------------------------------
  // 16 bit
  //------------------------------------------

  getUint16(offset) {
    return this.bytes[offset] | (this.bytes[offset + 1] << 8);
  }

  setUint16(offset, value) {
    this.bytes[offset] = value & 0xff;
    this.bytes[offset + 1] = (value >> 8) & 0xff;
  }

  //------------------------------------------
  // 32 bit
  //------------------------------------------

  getUint32(offset) {
    return (
      (this.bytes[offset] |
        (this.bytes[offset + 1] << 8) |
        (this.bytes[offset + 2] << 16) |
        (this.bytes[offset + 3] << 24)) >>>
      0
    );
  }

  setUint32(offset, value) {
    this.bytes[offset] = value & 0xff;
    this.bytes[offset + 1] = (value >> 8) & 0xff;
    this.bytes[offset + 2] = (value >> 16) & 0xff;
    this.bytes[offset + 3] = (value >> 24) & 0xff;
  }

  //------------------------------------------
  // Byte Array
  //------------------------------------------

  getBytes(offset, length) {
    return this.bytes.slice(offset, offset + length);
  }

  setBytes(offset, data) {
    if (!(data instanceof Uint8Array))
      throw new Error('data must be a Uint8Array.');

    this.bytes.set(data, offset);
  }
}
