export default class RFZone {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;
  }

  get data() {
    return (
      (this.buffer[this.offset] |
        (this.buffer[this.offset + 1] << 8) |
        (this.buffer[this.offset + 2] << 16) |
        (this.buffer[this.offset + 3] << 24)) >>>
      0
    );
  }

  set data(value) {
    value = value >>> 0;

    this.buffer[this.offset] = value & 0xff;

    this.buffer[this.offset + 1] = (value >>> 8) & 0xff;

    this.buffer[this.offset + 2] = (value >>> 16) & 0xff;

    this.buffer[this.offset + 3] = (value >>> 24) & 0xff;
  }

  //----------------------------------

  clear() {
    this.raw = 0;
  }
}
