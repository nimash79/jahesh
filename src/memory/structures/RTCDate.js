export default class RTCDate {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;
  }

  get year() {
    return this.buffer.getUint8(this.offset);
  }

  set year(value) {
    this.buffer.setUint8(this.offset, value);
  }

  get month() {
    return this.buffer.getUint8(this.offset + 1);
  }

  set month(value) {
    this.buffer.setUint8(this.offset + 1, value);
  }

  get date() {
    return this.buffer.getUint8(this.offset + 2);
  }

  set date(value) {
    this.buffer.setUint8(this.offset + 2, value);
  }

  get raw() {
    return new Uint8Array(this.buffer, this.offset, 3);
  }

  set raw(value) {
    this.buffer.setUint8(this.offset, value[0]);
    this.buffer.setUint8(this.offset + 1, value[1]);
    this.buffer.setUint8(this.offset + 2, value[2]);
  }

  clear() {
    this.raw = [0, 0, 0];
  }
}