export class MemDesign {
  constructor(bufferOrLength = 168) {
    if (bufferOrLength instanceof ArrayBuffer) {
      this.buffer = bufferOrLength;
    } else if (ArrayBuffer.isView(bufferOrLength)) {
      this.buffer = bufferOrLength.buffer.slice(
        bufferOrLength.byteOffset,
        bufferOrLength.byteOffset + bufferOrLength.byteLength,
      );
    } else if (typeof bufferOrLength === 'number') {
      this.buffer = new ArrayBuffer(bufferOrLength);
    } else {
      this.buffer = new ArrayBuffer(168);
    }

    this.view = new DataView(this.buffer);
    this.bytes = new Uint8Array(this.buffer);

    // ساخت پروکسی‌ها برای آرایه‌ها و زیر-ساختارها
    this._initSubStructures();
  }

  // دسترسی مستقیم به بایت‌های خام (جهت ارسال روی Serial/Bluetooth/MQTT)
  get rawBytes() {
    return this.bytes;
  }

  set rawBytes(uint8Array) {
    this.bytes.set(uint8Array);
  }

  _initSubStructures() {
    // --- 1. Zons[9] ---
    this.Zons = Array.from({ length: 9 }, (_, i) => {
      const offset = 0 + i * 2;
      return {
        Work_zone: {
          get Fire_mode() {
            return (this._parent.view.getUint8(offset) >> 0) & 0x01;
          },
          set Fire_mode(v) {
            this._parent._setBit(offset, 0, v);
          },
          get _24h_mode() {
            return (this._parent.view.getUint8(offset) >> 1) & 0x01;
          },
          set _24h_mode(v) {
            this._parent._setBit(offset, 1, v);
          },
          get Normal_mode() {
            return (this._parent.view.getUint8(offset) >> 2) & 0x01;
          },
          set Normal_mode(v) {
            this._parent._setBit(offset, 2, v);
          },
          get State_pin_read() {
            return (this._parent.view.getUint8(offset) >> 3) & 0x01;
          },
          set State_pin_read(v) {
            this._parent._setBit(offset, 3, v);
          },
          _parent: this,
        },
        Outputs_zone: {
          get Ding_dong() {
            return (this._parent.view.getUint8(offset + 1) >> 0) & 0x01;
          },
          set Ding_dong(v) {
            this._parent._setBit(offset + 1, 0, v);
          },
          get Sms() {
            return (this._parent.view.getUint8(offset + 1) >> 1) & 0x01;
          },
          set Sms(v) {
            this._parent._setBit(offset + 1, 1, v);
          },
          get G_tell() {
            return (this._parent.view.getUint8(offset + 1) >> 2) & 0x01;
          },
          set G_tell(v) {
            this._parent._setBit(offset + 1, 2, v);
          },
          get Siren() {
            return (this._parent.view.getUint8(offset + 1) >> 3) & 0x01;
          },
          set Siren(v) {
            this._parent._setBit(offset + 1, 3, v);
          },
          get Speaker() {
            return (this._parent.view.getUint8(offset + 1) >> 4) & 0x01;
          },
          set Speaker(v) {
            this._parent._setBit(offset + 1, 4, v);
          },
          _parent: this,
        },
      };
    });

    // --- 2. Phone_numbers[5] (Union) ---
    this.Phone_numbers = Array.from({ length: 5 }, (_, i) => {
      const offset = 18 + i * 6;
      const parent = this;
      return {
        get data() {
          return parent.bytes.subarray(offset, offset + 6);
        },
        set data(arr) {
          parent.bytes.set(arr.slice(0, 6), offset);
        },
        Number_settings: {
          get ambient_listening() {
            return (parent.view.getUint8(offset) >> 0) & 0x01;
          },
          set ambient_listening(v) {
            parent._setBit(offset, 0, v);
          },
          get admin() {
            return (parent.view.getUint8(offset) >> 1) & 0x01;
          },
          set admin(v) {
            parent._setBit(offset, 1, v);
          },
          get report() {
            return (parent.view.getUint8(offset) >> 2) & 0x01;
          },
          set report(v) {
            parent._setBit(offset, 2, v);
          },
          get guard() {
            return (parent.view.getUint8(offset) >> 3) & 0x01;
          },
          set guard(v) {
            parent._setBit(offset, 3, v);
          },
          get reserved() {
            return (parent.view.getUint8(offset) >> 4) & 0x0f;
          },
          set reserved(v) {
            let b = parent.view.getUint8(offset) & 0x0f;
            parent.view.setUint8(offset, b | ((v & 0x0f) << 4));
          },
        },
      };
    });

    // --- 3. System_settings (Binary_S_C Union) ---
    const sysOffset = 48;
    this.System_settings = {
      get Data() {
        return parent.view.getUint16(sysOffset, true);
      },
      set Data(v) {
        parent.view.setUint16(sysOffset, v, true);
      },
      S_Settings: {
        get period_time() {
          return parent.view.getUint16(sysOffset, true) & 0x07;
        },
        set period_time(v) {
          parent._setBits16(sysOffset, 0, 3, v);
        },
        get notification_state() {
          return (parent.view.getUint16(sysOffset, true) >> 3) & 0x01;
        },
        set notification_state(v) {
          parent._setBits16(sysOffset, 3, 1, v);
        },
        get mode() {
          return (parent.view.getUint16(sysOffset, true) >> 4) & 0x01;
        },
        set mode(v) {
          parent._setBits16(sysOffset, 4, 1, v);
        },
        get doubl_security_state() {
          return (parent.view.getUint16(sysOffset, true) >> 5) & 0x01;
        },
        set doubl_security_state(v) {
          parent._setBits16(sysOffset, 5, 1, v);
        },
        get doubl_security_min() {
          return (parent.view.getUint16(sysOffset, true) >> 6) & 0x07;
        },
        set doubl_security_min(v) {
          parent._setBits16(sysOffset, 6, 3, v);
        },
        get sms_lang() {
          return (parent.view.getUint16(sysOffset, true) >> 9) & 0x01;
        },
        set sms_lang(v) {
          parent._setBits16(sysOffset, 9, 1, v);
        },
        get relay_state() {
          return (parent.view.getUint16(sysOffset, true) >> 10) & 0x01;
        },
        set relay_state(v) {
          parent._setBits16(sysOffset, 10, 1, v);
        },
      },
    };
    const parent = this;

    // --- 4. Passwords ---
    this.Passwords = {
      get menu_pass() {
        return parent.view.getUint16(50, true);
      },
      set menu_pass(v) {
        parent.view.setUint16(50, v, true);
      },
      get tell_pass() {
        return parent.view.getUint16(52, true);
      },
      set tell_pass(v) {
        parent.view.setUint16(52, v, true);
      },
    };

    // --- 5. Rf_mem[10] (Remote_rf Union) ---
    this.Rf_mem = Array.from({ length: 10 }, (_, i) => {
      const offset = 55 + i * 4;
      return {
        get Data() {
          return parent.view.getUint32(offset, true);
        },
        set Data(v) {
          parent.view.setUint32(offset, v, true);
        },
        Remote_: {
          get address_code() {
            return parent.view.getUint32(offset, true) & 0xfffff;
          },
          set address_code(v) {
            parent._setBits32(offset, 0, 20, v);
          },
          get key() {
            return (parent.view.getUint32(offset, true) >>> 20) & 0x0f;
          },
          set key(v) {
            parent._setBits32(offset, 20, 4, v);
          },
          get setings() {
            return (parent.view.getUint32(offset, true) >>> 24) & 0xff;
          },
          set setings(v) {
            parent._setBits32(offset, 24, 8, v);
          },
        },
      };
    });

    // --- 6. rf_zone[5] (Rf_zone Union) ---
    this.rf_zone = Array.from({ length: 5 }, (_, i) => {
      const offset = 95 + i * 4;
      return {
        get Data() {
          return parent.view.getUint32(offset, true);
        },
        set Data(v) {
          parent.view.setUint32(offset, v, true);
        },
      };
    });

    // --- 7. timers[7] ---
    this.timers = Array.from({ length: 7 }, (_, i) => {
      const offset = 115 + i * 6;
      return {
        get relay_num() {
          return parent.view.getUint8(offset);
        },
        set relay_num(v) {
          parent.view.setUint8(offset, v);
        },
        get timer() {
          return parent.view.getUint8(offset + 1);
        },
        set timer(v) {
          parent.view.setUint8(offset + 1, v);
        },
        get state_() {
          return parent.view.getUint8(offset + 2);
        },
        set state_(v) {
          parent.view.setUint8(offset + 2, v);
        },
        get hours() {
          return parent.view.getUint8(offset + 3);
        },
        set hours(v) {
          parent.view.setUint8(offset + 3, v);
        },
        get min() {
          return parent.view.getUint8(offset + 4);
        },
        set min(v) {
          parent.view.setUint8(offset + 4, v);
        },
        get weekday() {
          return parent.view.getUint8(offset + 5);
        },
        set weekday(v) {
          parent.view.setUint8(offset + 5, v);
        },
      };
    });

    // --- 8. relay_setting ---
    this.relay_setting = {
      get relay_mode() {
        return parent.view.getUint8(158);
      },
      set relay_mode(v) {
        parent.view.setUint8(158, v);
      },
      get relay_state() {
        return parent.view.getUint8(159);
      },
      set relay_state(v) {
        parent.view.setUint8(159, v);
      },
      get relay_time() {
        return parent.view.getUint8(160);
      },
      set relay_time(v) {
        parent.view.setUint8(160, v);
      },
    };

    // --- 9. current_time ---
    this.current_time = {
      get Hours() {
        return parent.view.getUint8(161);
      },
      set Hours(v) {
        parent.view.setUint8(161, v);
      },
      get Minutes() {
        return parent.view.getUint8(162);
      },
      set Minutes(v) {
        parent.view.setUint8(162, v);
      },
      get Seconds() {
        return parent.view.getUint8(163);
      },
      set Seconds(v) {
        parent.view.setUint8(163, v);
      },
    };

    // --- 10. current_date ---
    this.current_date = {
      get Year() {
        return parent.view.getUint8(164);
      },
      set Year(v) {
        parent.view.setUint8(164, v);
      },
      get Month() {
        return parent.view.getUint8(165);
      },
      set Month(v) {
        parent.view.setUint8(165, v);
      },
      get Date() {
        return parent.view.getUint8(166);
      },
      set Date(v) {
        parent.view.setUint8(166, v);
      },
    };
  }

  // --- تک اعضای مستقیم ---
  get device_state() {
    return this.view.getUint8(54);
  }
  set device_state(v) {
    this.view.setUint8(54, v);
  }

  get Debt_status() {
    return this.view.getUint8(157);
  }
  set Debt_status(v) {
    this.view.setUint8(157, v);
  }

  get chek_sum_cal() {
    return this.view.getUint8(167);
  }
  set chek_sum_cal(v) {
    this.view.setUint8(167, v);
  }

  // --- توابع کمکی برای کار با Bitfield‌ها ---
  _setBit(offset, bitIndex, val) {
    let b = this.view.getUint8(offset);
    if (val) b |= 1 << bitIndex;
    else b &= ~(1 << bitIndex);
    this.view.setUint8(offset, b);
  }

  _setBits16(offset, bitStart, bitLen, val) {
    let cur = this.view.getUint16(offset, true);
    const mask = ((1 << bitLen) - 1) << bitStart;
    cur = (cur & ~mask) | ((val << bitStart) & mask);
    this.view.getUint16 ? this.view.setUint16(offset, cur, true) : null;
  }

  _setBits32(offset, bitStart, bitLen, val) {
    let cur = this.view.getUint32(offset, true);
    const mask = (((1 << bitLen) - 1) >>> 0) << bitStart;
    cur = (cur & ~mask) | ((val << bitStart) & mask);
    this.view.setUint32(offset, cur, true);
  }

  getPhoneNumberAsNumber(d) {
    if (!d || d.length < 6) return 0;
    return (
      d[1] + d[2] * 256 + d[3] * 65536 + d[4] * 16777216 + d[5] * 4294967296
    );
  }
  log() {
    console.group('========== COMPLETE MEM_DESIGN DATA DUMP ==========');

    // 1. Zons[9]
    console.group('1. Zons[9]');
    this.Zons.forEach((z, i) => {
      console.group(`Zone [${i}]`);
      console.log('Work_zone -> Fire_mode:', z.Work_zone.Fire_mode);
      console.log('Work_zone -> _24h_mode:', z.Work_zone._24h_mode);
      console.log('Work_zone -> Normal_mode:', z.Work_zone.Normal_mode);
      console.log('Work_zone -> State_pin_read:', z.Work_zone.State_pin_read);
      console.log('Outputs_zone -> Ding_dong:', z.Outputs_zone.Ding_dong);
      console.log('Outputs_zone -> Sms:', z.Outputs_zone.Sms);
      console.log('Outputs_zone -> G_tell:', z.Outputs_zone.G_tell);
      console.log('Outputs_zone -> Siren:', z.Outputs_zone.Siren);
      console.log('Outputs_zone -> Speaker:', z.Outputs_zone.Speaker);
      console.groupEnd();
    });
    console.groupEnd();

    // 2. Phone_numbers[5]
    console.group('2. Phone_numbers[5]');
    this.Phone_numbers.forEach((p, i) => {
      console.group(`Phone [${i}]`);
      console.log('data (Array):', p.data);
      console.log(
        'Number_settings -> ambient_listening:',
        p.Number_settings.ambient_listening,
      );
      console.log('Number_settings -> admin:', p.Number_settings.admin);
      console.log('Number_settings -> report:', p.Number_settings.report);
      console.log('Number_settings -> guard:', p.Number_settings.guard);
      console.log('Number_settings -> reserved:', p.Number_settings.reserved);
      console.groupEnd();
    });
    console.groupEnd();

    // 3. System_settings
    console.group('3. System_settings');
    console.log('Data (Raw uint16):', this.System_settings.Data);
    console.log(
      'S_Settings -> period_time:',
      this.System_settings.S_Settings.period_time,
    );
    console.log(
      'S_Settings -> notification_state:',
      this.System_settings.S_Settings.notification_state,
    );
    console.log('S_Settings -> mode:', this.System_settings.S_Settings.mode);
    console.log(
      'S_Settings -> doubl_security_state:',
      this.System_settings.S_Settings.doubl_security_state,
    );
    console.log(
      'S_Settings -> doubl_security_min:',
      this.System_settings.S_Settings.doubl_security_min,
    );
    console.log(
      'S_Settings -> sms_lang:',
      this.System_settings.S_Settings.sms_lang,
    );
    console.log(
      'S_Settings -> relay_state:',
      this.System_settings.S_Settings.relay_state,
    );
    console.groupEnd();

    // 4. Passwords
    console.group('4. Passwords');
    console.log('menu_pass:', this.Passwords.menu_pass);
    console.log('tell_pass:', this.Passwords.tell_pass);
    console.groupEnd();

    // 5. device_state
    console.log('5. device_state:', this.device_state);

    // 6. Rf_mem[10]
    console.group('6. Rf_mem[10]');
    this.Rf_mem.forEach((r, i) => {
      console.group(`Rf_mem [${i}]`);
      console.log('Data (Raw uint32):', r.Data);
      console.log('Remote_ -> address_code:', r.Remote_.address_code);
      console.log('Remote_ -> key:', r.Remote_.key);
      console.log('Remote_ -> setings:', r.Remote_.setings);
      console.groupEnd();
    });
    console.groupEnd();

    // 7. rf_zone[5]
    console.group('7. rf_zone[5]');
    this.rf_zone.forEach((rf, i) => {
      console.log(`rf_zone [${i}] Data:`, rf.Data);
    });
    console.groupEnd();

    // 8. timers[7]
    console.group('8. timers[7]');
    this.timers.forEach((t, i) => {
      console.group(`Timer [${i}]`);
      console.log('relay_num:', t.relay_num);
      console.log('timer:', t.timer);
      console.log('state_:', t.state_);
      console.log('hours:', t.hours);
      console.log('min:', t.min);
      console.log('weekday:', t.weekday);
      console.groupEnd();
    });
    console.groupEnd();

    // 9. Debt_status
    console.log('9. Debt_status:', this.Debt_status);

    // 10. relay_setting
    console.group('10. relay_setting');
    console.log('relay_mode:', this.relay_setting.relay_mode);
    console.log('relay_state:', this.relay_setting.relay_state);
    console.log('relay_time:', this.relay_setting.relay_time);
    console.groupEnd();

    // 11. current_time
    console.group('11. current_time');
    console.log('Hours:', this.current_time.Hours);
    console.log('Minutes:', this.current_time.Minutes);
    console.log('Seconds:', this.current_time.Seconds);
    console.groupEnd();

    // 12. current_date
    console.group('12. current_date');
    console.log('Year:', this.current_date.Year);
    console.log('Month:', this.current_date.Month);
    console.log('Date:', this.current_date.Date);
    console.groupEnd();

    // 13. chek_sum_cal
    console.log('13. chek_sum_cal:', this.chek_sum_cal);

    console.groupEnd();
  }
}
