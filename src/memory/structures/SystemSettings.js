import BitField from '../utils/BitField';

export default class SystemSettings {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.offset = offset;

    this._periodTime = new BitField(buffer, offset, 0, 3);

    this._notificationState = new BitField(buffer, offset, 3);

    this._mode = new BitField(buffer, offset, 4);

    this._doubleSecurityState = new BitField(buffer, offset, 5);

    this._doubleSecurityMin = new BitField(buffer, offset, 6, 3);

    this._smsLang = new BitField(buffer, offset, 9);

    this._relayState = new BitField(buffer, offset, 10);
  }

  //----------------------------------
  // Raw Value
  //----------------------------------

  get raw() {
    return (
      this.buffer.getUint8(this.offset) |
      (this.buffer.getUint8(this.offset + 1) << 8) |
      (this.buffer.getUint8(this.offset + 2) << 16)
    );
  }

  set raw(value) {
    this.buffer.setUint8(this.offset, value & 0xFF);
    this.buffer.setUint8(this.offset + 1, (value >> 8) & 0xFF);
    this.buffer.setUint8(this.offset + 2, (value >> 16) & 0xFF);
  }

  //------------------------------------
  // period_time
  //------------------------------------

  get periodTime() {
    return this._periodTime.value;
  }

  set periodTime(v) {
    this._periodTime.value = v;
  }

  //------------------------------------

  get notificationState() {
    return this._notificationState.boolean;
  }

  set notificationState(v) {
    this._notificationState.boolean = v;
  }

  //------------------------------------

  get mode() {
    return this._mode.boolean;
  }

  set mode(v) {
    this._mode.boolean = v;
  }

  //------------------------------------

  get doubleSecurityState() {
    return this._doubleSecurityState.boolean;
  }

  set doubleSecurityState(v) {
    this._doubleSecurityState.boolean = v;
  }

  //------------------------------------

  get doubleSecurityMin() {
    return this._doubleSecurityMin.value;
  }

  set doubleSecurityMin(v) {
    this._doubleSecurityMin.value = v;
  }

  //------------------------------------

  get smsLang() {
    return this._smsLang.boolean;
  }

  set smsLang(v) {
    this._smsLang.boolean = v;
  }

  //------------------------------------

  get relayState() {
    return this._relayState.boolean;
  }

  set relayState(v) {
    this._relayState.boolean = v;
  }

  //------------------------------------

  clear() {
    this.raw = 0;
  }
}