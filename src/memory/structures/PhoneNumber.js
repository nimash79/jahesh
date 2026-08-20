import BitField from '../utils/BitField';

export default class PhoneNumber {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;

    this._ambient_listening = new BitField(buffer, offset, 0);
    this._admin = new BitField(buffer, offset, 1);
    this._report = new BitField(buffer, offset, 2);
    this._guard = new BitField(buffer, offset, 3);
  }

  //--------------------------------------------------
  // Settings (Byte 0)
  //--------------------------------------------------

  get ambient_listening() {
    return this._ambient_listening.boolean;
  }

  set ambient_listening(value) {
    this._ambient_listening.boolean = value;
  }

  get admin() {
    return this._admin.boolean;
  }

  set admin(value) {
    this._admin.boolean = value;
  }

  get report() {
    return this._report.boolean;
  }

  set report(value) {
    this._report.boolean = value;
  }

  get guard() {
    return this._guard.boolean;
  }

  set guard(value) {
    this._guard.boolean = value;
  }

  //--------------------------------------------------
  // Phone Number (5 bytes LE)
  //--------------------------------------------------

  get number() {
    let value = 0n;

    for (let i = 0; i < 5; i++) {
      value |=
        BigInt(this.buffer.getUint8(this.offset + 1 + i)) << BigInt(i * 8);
    }

    return value.toString();
  }

  set number(phone) {
    const value = BigInt(phone);

    for (let i = 0; i < 5; i++) {
      this.buffer.setUint8(
        this.offset + 1 + i,
        Number((value >> BigInt(i * 8)) & 0xffn),
      );
    }
  }

  //----------------------------------
  // Raw Bytes
  //----------------------------------

  get raw() {
    return this.buffer.getBytes(this.offset, 6);
  }

  set raw(bytes) {
    if (bytes.length !== 6)
      throw new Error('PhoneNumber raw data must contain exactly 6 bytes.');

    this.buffer.setBytes(this.offset, bytes);
  }

  //--------------------------------------------------

  clear() {
    for (let i = 0; i < 6; i++) {
      this.buffer.setUint8(this.offset + i, 0);
    }
  }
}
