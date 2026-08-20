export default class Passwords {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;
  }

  //---------------------------------------
  // Menu Password
  //---------------------------------------

  get menu() {
    return this.buffer.getUint16(this.offset);
  }

  set menu(value) {
    this.buffer.setUint16(this.offset, value);
  }

  //---------------------------------------
  // Telephone Password
  //---------------------------------------

  get tell() {
    return this.buffer.getUint16(this.offset + 2);
  }

  set tell(value) {
    this.buffer.setUint16(this.offset + 2, value);
  }

  //----------------------------------
  // Raw Bytes
  //----------------------------------

  get raw() {
    return this.buffer.getBytes(this.offset, 4);
  }

  set raw(bytes) {
    if (bytes.length !== 4)
      throw new Error('Passwords raw data must contain exactly 4 bytes.');

    this.buffer.setBytes(this.offset, bytes);
  }

  //---------------------------------------

  clear() {
    this.menu = 0;
    this.tell = 0;
  }
}
