import BinaryBuffer from './BinaryBuffer';

import Zone from './structures/Zone';
import PhoneNumber from './structures/PhoneNumber';
import Passwords from './structures/Passwords';
import SystemSettings from './structures/SystemSettings';
import RFRemote from './structures/RFRemote';
import RFZone from './structures/RFZone';
import Timer from './structures/Timer';
import RelaySettings from './structures/RelaySettings';
import RTCTime from './structures/RTCTime';
import RTCDate from './structures/RTCDate';

export default class MemoryDesign {
  static SIZE = 169;

  constructor(bytes = null) {
    this.buffer = new BinaryBuffer(bytes ?? MemoryDesign.SIZE);

    //-----------------------------------------
    // Arrays
    //-----------------------------------------

    this.zones = [];

    for (let i = 0; i < 9; i++) {
      this.zones.push(new Zone(this.buffer, i * 2));
    }

    this.phoneNumbers = [];

    for (let i = 0; i < 5; i++) {
      this.phoneNumbers.push(new PhoneNumber(this.buffer, 18 + i * 6));
    }

    this.rfRemotes = [];

    for (let i = 0; i < 10; i++) {
      this.rfRemotes.push(new RFRemote(this.buffer, 56 + i * 4));
    }

    this.rfZones = [];

    for (let i = 0; i < 5; i++) {
      this.rfZones.push(new RFZone(this.buffer, 96 + i * 4));
    }

    this.timers = [];

    for (let i = 0; i < 7; i++) {
      this.timers.push(new Timer(this.buffer, 116 + i * 6));
    }

    //-----------------------------------------
    // Single objects
    //-----------------------------------------

    this.systemSettings = new SystemSettings(this.buffer, 48);

    this.passwords = new Passwords(this.buffer, 51);

    this.relaySettings = new RelaySettings(this.buffer, 159);

    this.currentTime = new RTCTime(this.buffer, 162);
    this.currentDate = new RTCDate(this.buffer, 165);
  }

  //-----------------------------------------
  // Device state
  //-----------------------------------------

  get deviceState() {
    return this.buffer.getUint8(55) !== 0;
  }

  set deviceState(value) {
    this.buffer.setUint8(55, value ? 1 : 0);
  }

  //-----------------------------------------
  // Debt status
  //-----------------------------------------

  get debtStatus() {
    return this.buffer.getUint8(158);
  }

  set debtStatus(v) {
    this.buffer.setUint8(158, v);
  }

  //-----------------------------------------
  // Checksum
  //-----------------------------------------

  get checksum() {
    return this.buffer.getUint8(168);
  }

  set checksum(v) {
    this.buffer.setUint8(168, v);
  }

  //-----------------------------------------
  // Raw Bytes
  //-----------------------------------------

  load(bytes) {
    this.buffer.load(bytes);
  }

  get bytes() {
    return this.buffer.bytes;
  }

  toBytes() {
    return this.buffer.clone();
  }

  clear() {
    this.buffer.clear();
  }

  //-----------------------------------------
  // TO JSON
  //-----------------------------------------

  toJSON() {
    return {
      zones: this.zones.map(zone => ({
        fireMode: zone.fireMode,
        mode24h: zone.mode24h,
        normalMode: zone.normalMode,
        statePinRead: zone.statePinRead,

        dingDong: zone.dingDong,
        sms: zone.sms,
        gTell: zone.gTell,
        siren: zone.siren,
        speaker: zone.speaker,
      })),

      phoneNumbers: this.phoneNumbers.map(phone => ({
        number: phone.number,
        lobbyman: phone.lobbyman,
        admin: phone.admin,
        report: phone.report,
        guard: phone.guard,
      })),

      systemSettings: {
        raw: this.systemSettings.raw,
        periodTime: this.systemSettings.periodTime,
        notificationState: this.systemSettings.notificationState,
        mode: this.systemSettings.mode,
        doubleSecurityState: this.systemSettings.doubleSecurityState,
        doubleSecurityMin: this.systemSettings.doubleSecurityMin,
        smsLang: this.systemSettings.smsLang,
        relayState: this.systemSettings.relayState,
      },

      passwords: {
        menu: this.passwords.menu,
        tell: this.passwords.tell,
      },

      deviceState: this.deviceState,

      rfRemotes: this.rfRemotes.map(remote => ({
        raw: remote.raw,
        addressCode: remote.addressCode,
        key: remote.key,
        settings: remote.settings,
      })),

      rfZones: this.rfZones.map(zone => ({
        raw: zone.raw,
      })),

      timers: this.timers.map(timer => ({
        relayNumber: timer.relayNumber,
        timer: timer.timer,
        state: timer.state,
        hours: timer.hours,
        minutes: timer.minutes,
        weekday: timer.weekday,
      })),

      debtStatus: this.debtStatus,

      relaySettings: {
        relayMode: this.relaySettings.relayMode,
        relayState: this.relaySettings.relayState,
        relayTime: this.relaySettings.relayTime,
      },

      currentTime: {
        hours: this.currentTime.hours,
        minutes: this.currentTime.minutes,
        seconds: this.currentTime.seconds,
      },

      currentDate: {
        year: this.currentDate.year,
        month: this.currentDate.month,
        date: this.currentDate.date,
      },

      checksum: this.checksum,
    };
  }
}
