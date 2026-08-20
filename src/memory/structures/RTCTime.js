export default class RTCTime {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;
  }

  get hours() {
    return this.buffer.getUint8(this.offset);
  }

  set hours(value) {
    this.buffer.setUint8(this.offset, value);
  }

  get minutes() {
    return this.buffer.getUint8(this.offset + 1);
  }

  set minutes(value) {
    this.buffer.setUint8(this.offset + 1, value);
  }

  get seconds() {
    return this.buffer.getUint8(this.offset + 2);
  }

  set seconds(value) {
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