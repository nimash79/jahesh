import BitField from '../utils/BitField';

export default class RFRemote {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;

    this._addressCode = new BitField(buffer, offset, 0, 20);
    this._key = new BitField(buffer, offset, 20, 4);
    this._settings = new BitField(buffer, offset, 24, 8);
  }

  //----------------------------------
  // Raw Value
  //----------------------------------

  get raw() {
    return this.buffer.getUint32(this.offset);
  }

  set raw(value) {
    this.buffer.setUint32(this.offset, value);
  }

  //----------------------------------
  // Address Code (20 bits)
  //----------------------------------

  get addressCode() {
    return this._addressCode.value;
  }

  set addressCode(value) {
    this._addressCode.value = value;
  }

  //----------------------------------
  // Key (4 bits)
  //----------------------------------

  get key() {
    return this._key.value;
  }

  set key(value) {
    this._key.value = value;
  }

  //----------------------------------
  // Settings (8 bits)
  //----------------------------------

  get settings() {
    return this._settings.value;
  }

  set settings(value) {
    this._settings.value = value;
  }

  //----------------------------------

  clear() {
    this.raw = 0;
  }
}
