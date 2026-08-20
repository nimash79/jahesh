const FILE_URL = "http://2.185.144.31:5001/get_data";

//------------------------------------------------
// Bitfield Engine
//------------------------------------------------

function createBitStruct(buffer, offset, fields, bytes = 2) {
  const view = new DataView(buffer);
  const obj = {};

  let bitPos = 0;

  for (let f of fields) {
    const name = f.name;
    const size = f.bits;
    const mask = (1 << size) - 1;
    const pos = bitPos;

    Object.defineProperty(obj, name, {
      get() {
        let v;

        if (bytes === 1) v = view.getUint8(offset);
        else if (bytes === 2) v = view.getUint16(offset, true);
        else v = view.getUint32(offset, true);

        return (v >> pos) & mask;
      },

      set(val) {
        let v;

        if (bytes === 1) v = view.getUint8(offset);
        else if (bytes === 2) v = view.getUint16(offset, true);
        else v = view.getUint32(offset, true);

        v &= ~(mask << pos);
        v |= (val & mask) << pos;

        if (bytes === 1) view.setUint8(offset, v);
        else if (bytes === 2) view.setUint16(offset, v, true);
        else view.setUint32(offset, v, true);
      },
    });

    bitPos += size;
  }

  return obj;
}

//------------------------------------------------
// Zone  (2 bytes)
//------------------------------------------------

function createZone(buffer, offset) {
  const work = createBitStruct(
    buffer,
    offset,
    [
      { name: "Fire_mode", bits: 1 },
      { name: "_24h_mode", bits: 1 },
      { name: "Normal_mode", bits: 1 },
      { name: "State_pin_read", bits: 1 },
    ],
    1,
  );

  const outputs = createBitStruct(
    buffer,
    offset + 1,
    [
      { name: "Ding_dong", bits: 1 },
      { name: "Sms", bits: 1 },
      { name: "G_tell", bits: 1 },
      { name: "Siren", bits: 1 },
      { name: "Speaker", bits: 1 },
    ],
    1,
  );

  return {
    work_zone: work,
    outputs_zone: outputs,
  };
}

//------------------------------------------------
// Phone_number  (union 6 byte)
//------------------------------------------------

function decodePhone(p) {
    let num = 0n;

    for (let i = 0; i < 5; i++) {
        num |= BigInt(p[i + 1]) << BigInt(8 * i);
    }

    return num.toString();
}

function encodePhone(str, p) {
    // به BigInt تبدیل کن
    const num = BigInt(str);

    // تبدیل به 5 بایت little-endian
    for (let i = 0; i < 5; i++) {
        p[i + 1] = Number((num >> BigInt(8 * i)) & 0xFFn);
    }
}

function createPhone(buffer, offset) {
  const data = new Uint8Array(buffer, offset, 6);

  const setting = createBitStruct(
    buffer,
    offset,
    [
      { name: "ambient_listening", bits: 1 },
      { name: "admin", bits: 1 },
      { name: "report", bits: 1 },
      { name: "guard", bits: 1 },
      { name: "reserved", bits: 4 },
    ],
    1,
  );

  return {
    number_settings: setting,
    get data() {
      return decodePhone(data);
    },
    set data(v) {
      encodePhone(v, data);
    },
  };
}

//------------------------------------------------
// Binary_S_C  (2 bytes union)
//------------------------------------------------

function createBinarySC(buffer, offset) {
  const view = new DataView(buffer);

  const settings = createBitStruct(
    buffer,
    offset,
    [
      { name: "period_time", bits: 3 },
      { name: "notification_state", bits: 1 },
      { name: "mode", bits: 1 },
      { name: "double_security_state", bits: 1 },
      { name: "double_security_min", bits: 3 },
      { name: "sms_lang", bits: 1 },
      { name: "reserved", bits: 6 },
    ],
    2,
  );

  return {
    S_Settings: settings,

    get data() {
      return view.getUint16(offset, true);
    },
    set data(v) {
      view.setUint16(offset, v, true);
    },
  };
}

//------------------------------------------------
// System_pass (4 bytes)
//------------------------------------------------

function createSystemPass(buffer, offset) {
  const view = new DataView(buffer);

  return {
    get menu_pass() {
      return view.getUint16(offset, true);
    },
    set menu_pass(v) {
      view.setUint16(offset, v, true);
    },

    get tell_pass() {
      return view.getUint16(offset + 2, true);
    },
    set tell_pass(v) {
      view.setUint16(offset + 2, v, true);
    },
  };
}

//------------------------------------------------
// device_state (1 byte)
//------------------------------------------------

// ابزارهای کمکی
function writeBit(byte, index, value) {
  return value ? (byte | (1 << index)) : (byte & ~(1 << index));
}

function getBit(byte, index) {
  return (byte >> index) & 1;
}

// ساختار device_state
function createDeviceState(buffer, offset) {
  const view = new Uint8Array(buffer, offset, 1); // یک بایت

  return {
    // دسترسی مستقیم برای نیازهای دیباگ
    get raw() { return view[0]; },
    set raw(v) { view[0] = v & 0xFF; },

    // بیت 0: قفل/باز
    get locked() { return getBit(view[0], 0); },         // 0 یا 1
    set locked(v) { view[0] = writeBit(view[0], 0, v); },

    // بیت‌های 1..7: رله‌ها
    get relay1() { return getBit(view[0], 1); },
    set relay1(v) { view[0] = writeBit(view[0], 1, v); },

    get relay2() { return getBit(view[0], 2); },
    set relay2(v) { view[0] = writeBit(view[0], 2, v); },

    get relay3() { return getBit(view[0], 3); },
    set relay3(v) { view[0] = writeBit(view[0], 3, v); },

    get relay4() { return getBit(view[0], 4); },
    set relay4(v) { view[0] = writeBit(view[0], 4, v); },

    get relay5() { return getBit(view[0], 5); },
    set relay5(v) { view[0] = writeBit(view[0], 5, v); },

    get relay6() { return getBit(view[0], 6); },
    set relay6(v) { view[0] = writeBit(view[0], 6, v); },

    get relay7() { return getBit(view[0], 7); },
    set relay7(v) { view[0] = writeBit(view[0], 7, v); },

    // روش جمعی برای سهولت
    get relays() {
      // آرایه‌ای از 7 مقدار 0/1 برای رله‌ها
      return [
        getBit(view[0], 1),
        getBit(view[0], 2),
        getBit(view[0], 3),
        getBit(view[0], 4),
        getBit(view[0], 5),
        getBit(view[0], 6),
        getBit(view[0], 7),
      ];
    },
    set relays(arr) {
      // انتظار آرایه‌ای با طول حداکثر 7
      for (let i = 0; i < Math.min(7, arr.length); i++) {
        view[0] = writeBit(view[0], i + 1, arr[i]);
      }
    },

    // یک متد کاربردی: ست به‌صورت ماسک 7 بیتی برای رله‌ها
    setRelaysMask(mask /* 0..0x7F */) {
      // قفل را نگه داریم، فقط بیت‌های 1..7 را تغییر دهیم
      const lockBit = view[0] & 0x01;
      const relays = (mask & 0x7F) << 1;
      view[0] = lockBit | relays;
    }
  };
}


//------------------------------------------------
// Remote_rf (4 bytes)
//------------------------------------------------

function createRemote(buffer, offset) {
  const view = new DataView(buffer);

  return {
    get data() {
      return view.getUint32(offset, true);
    },
    set data(v) {
      view.setUint32(offset, v, true);
    },
  };
}

//------------------------------------------------
// Rf_zone (4 bytes)
//------------------------------------------------

function createRfZone(buffer, offset) {
  const view = new DataView(buffer);

  return {
    get data() {
      return view.getUint32(offset, true);
    },
    set data(v) {
      view.setUint32(offset, v, true);
    },
  };
}

//------------------------------------------------
// Mem_disign  (111 bytes)
//------------------------------------------------

export function createMem() {
  const SIZE = 111;

  const mem = {
    buffer: new ArrayBuffer(SIZE),
  };

  mem.bytes = new Uint8Array(mem.buffer);

  let off = 0;

  //---------------------------------
  // Zones[9]
  //---------------------------------

  mem.zones = Array.from({ length: 9 }, () => {
    const z = createZone(mem.buffer, off);
    off += 2;
    return z;
  });

  //---------------------------------
  // phone_numbers[5]
  //---------------------------------

  mem.phone_numbers = Array.from({ length: 5 }, () => {
    const p = createPhone(mem.buffer, off);
    off += 6;
    return p;
  });

  //---------------------------------
  // system_settings
  //---------------------------------

  mem.system_settings = createBinarySC(mem.buffer, off);
  off += 2;

  //---------------------------------
  // passwords
  //---------------------------------

  mem.passwords = createSystemPass(mem.buffer, off);
  off += 4;

  //---------------------------------
  // device_state
  //---------------------------------

  mem.device_state = createDeviceState(mem.buffer, off);
  off += 1;

  //---------------------------------
  // rf_mem[10]
  //---------------------------------

  mem.rf_mem = Array.from({ length: 10 }, () => {
    const r = createRemote(mem.buffer, off);
    off += 4;
    return r;
  });

  //---------------------------------
  // rf_zones[4]
  //---------------------------------

  mem.rf_zones = Array.from({ length: 4 }, () => {
    const r = createRfZone(mem.buffer, off);
    off += 4;
    return r;
  });

  return mem;
}

function hexDump(uint8, bytesPerLine = 16) {
  let out = "";

  for (let i = 0; i < uint8.length; i += bytesPerLine) {
    let addr = i.toString(16).padStart(4, "0");

    let hex = "";
    let ascii = "";

    for (let j = 0; j < bytesPerLine; j++) {
      if (i + j < uint8.length) {
        const b = uint8[i + j];

        hex += b.toString(16).padStart(2, "0") + " ";

        ascii += b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
      } else {
        hex += "   ";
        ascii += " ";
      }
    }

    out += addr + "  " + hex + " " + ascii + "\n";
  }

  console.log(out);
}

export async function loadMemFromUrl() {
  const res = await fetch(FILE_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);

  const mem = createMem();
  const arrayBuffer = await res.arrayBuffer();
  const raw = new Uint8Array(arrayBuffer);

  if (raw.length !== mem.bytes.length)
    throw new Error(
      "Invalid size: " + raw.length + " expected: " + mem.bytes.length,
    );

  mem.bytes.set(raw);
  return mem;
}

// console.log(memory.passwords.menu_pass)
// console.log(memory.passwords.tell_pass)
// console.log(memory.phone_numbers[0]);

// hexDump(memory.bytes)
