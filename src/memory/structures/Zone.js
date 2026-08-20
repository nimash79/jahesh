import BitField from '../utils/BitField';

export default class Zone {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;

    this._fireMode = new BitField(buffer, offset, 0);
    this._h24Mode = new BitField(buffer, offset, 1);
    this._normalMode = new BitField(buffer, offset, 2);
    this._statePinRead = new BitField(buffer, offset, 3);

    this._dingDong = new BitField(buffer, offset + 1, 0);
    this._sms = new BitField(buffer, offset + 1, 1);
    this._gTell = new BitField(buffer, offset + 1, 2);
    this._siren = new BitField(buffer, offset + 1, 3);
    this._speaker = new BitField(buffer, offset + 1, 4);
  }

  //--------------------------------------------------
  // Byte 0
  //--------------------------------------------------

  get fireMode() {
    return this._fireMode.boolean;
  }

  set fireMode(value) {
    this._fireMode.boolean = value;
  }

  get h24Mode() {
    return this._h24Mode.boolean;
  }

  set h24Mode(value) {
    this._h24Mode.boolean = value;
  }

  get normalMode() {
    return this._normalMode.boolean;
  }

  set normalMode(value) {
    this._normalMode.boolean = value;
  }

  get statePinRead() {
    return this._statePinRead.boolean;
  }

  set statePinRead(value) {
    this._statePinRead.boolean = value;
  }

  //--------------------------------------------------
  // Byte 1
  //--------------------------------------------------

  get dingDong() {
    return this._dingDong.boolean;
  }

  set dingDong(value) {
    this._dingDong.boolean = value;
  }

  get sms() {
    return this._sms.boolean;
  }

  set sms(value) {
    this._sms.boolean = value;
  }

  get gTell() {
    return this._gTell.boolean;
  }

  set gTell(value) {
    this._gTell.boolean = value;
  }

  get siren() {
    return this._siren.boolean;
  }

  set siren(value) {
    this._siren.boolean = value;
  }

  get speaker() {
    return this._speaker.boolean;
  }

  set speaker(value) {
    this._speaker.boolean = value;
  }

  //----------------------------------
  // Raw Bytes
  //----------------------------------

  get raw() {
    return this.buffer.getBytes(this.offset, 2);
  }

  set raw(bytes) {
    if (bytes.length !== 2)
      throw new Error('Zone raw data must contain exactly 2 bytes.');

    this.buffer.setBytes(this.offset, bytes);
  }

  //--------------------------------------------------

  clear() {
    this.buffer.setUint8(this.offset, 0);
    this.buffer.setUint8(this.offset + 1, 0);
  }
}
