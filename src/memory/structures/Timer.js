import ByteField from '../utils/ByteField';

export default class Timer {
  constructor(buffer, offset) {
    this._relayNum = new ByteField(buffer, offset);
    this._timer = new ByteField(buffer, offset + 1);
    this._state = new ByteField(buffer, offset + 2);
    this._hours = new ByteField(buffer, offset + 3);
    this._minutes = new ByteField(buffer, offset + 4);
    this._weekday = new ByteField(buffer, offset + 5);
  }

  //----------------------------------
  // Relay Number
  //----------------------------------

  get relayNum() {
    return this._relayNum.value;
  }

  set relayNum(value) {
    this._relayNum.value = value;
  }

  //----------------------------------
  // Timer
  //----------------------------------

  get timer() {
    return this._timer.value;
  }

  set timer(value) {
    this._timer.value = value;
  }

  //----------------------------------
  // State
  //----------------------------------

  get state() {
    return this._state.value;
  }

  set state(value) {
    this._state.value = value;
  }

  //----------------------------------
  // Hours
  //----------------------------------

  get hours() {
    return this._hours.value;
  }

  set hours(value) {
    this._hours.value = value;
  }

  //----------------------------------
  // Minutes
  //----------------------------------

  get minutes() {
    return this._minutes.value;
  }

  set minutes(value) {
    this._minutes.value = value;
  }

  //----------------------------------
  // Weekday
  //----------------------------------

  get weekday() {
    return this._weekday.value;
  }

  set weekday(value) {
    this._weekday.value = value;
  }

  //----------------------------------
  // Object
  //----------------------------------

  get object() {
    return {
      relayNum: this.relayNum,
      timer: this.timer,
      state: this.state,
      hours: this.hours,
      minutes: this.minutes,
      weekday: this.weekday,
    };
  }

  set object(value) {
    if (!value) return;

    if (value.relayNum !== undefined) this.relayNum = value.relayNum;

    if (value.timer !== undefined) this.timer = value.timer;

    if (value.state !== undefined) this.state = value.state;

    if (value.hours !== undefined) this.hours = value.hours;

    if (value.minutes !== undefined) this.minutes = value.minutes;

    if (value.weekday !== undefined) this.weekday = value.weekday;
  }

  //----------------------------------

  clear() {
    this.relayNum = 0;
    this.timer = 0;
    this.state = 0;
    this.hours = 0;
    this.minutes = 0;
    this.weekday = 0;
  }
}
