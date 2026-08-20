import moment from 'jalali-moment';
import { FIX_TEXT, STORAGE_KEYS } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { decode as base64Decode } from 'base-64';
import { changeConnection } from '../reducers/connectionReducer';
import { store } from '../store';

export const twoDigit = num => {
  return ('0' + num).slice(-2);
};

export const toShamsi = date => {
  moment.locale('fa', { useGregorianParser: true });
  return moment(date).format('YYYY/MM/DD');
};

export const getTime = date => {
  moment.locale('fa', { useGregorianParser: true });
  return moment(date).format('hh:mm');
};

export const formatTimeToHHmmss = timeValue => {
  if (!timeValue) return '';
  const parts = timeValue.split(':'); // ["HH","mm"] or ["HH","mm","ss"]
  const hh = parts[0].padStart(2, '0');
  const mm = (parts[1] ?? '00').padStart(2, '0');
  const ss = (parts[2] ?? '00').padStart(2, '0');
  return `${hh}${mm}${ss}`;
};

export const toMiladiYYMMDD = shamsiDate => {
  return moment(shamsiDate, 'jYYYY/jMM/jDD').format('YYMMDD');
};

export const bin4ToHex = bin4 => {
  if (!/^[01]{4}$/.test(bin4))
    throw new Error("Expected exactly 4 bits (e.g. '1010').");
  return parseInt(bin4, 2).toString(16).toUpperCase();
};

export const bin5ToHex = bin5 => {
  if (!/^[01]{5}$/.test(bin5))
    throw new Error("Expected exactly 5 bits (e.g. '10101').");
  return parseInt(bin5, 2).toString(16).toUpperCase().padStart(2, '0');
};

export const binToNumber = bin => {
  if (!/^[01]+$/.test(bin)) throw new Error('Expected only 0/1 characters.');
  return parseInt(bin, 2);
};

export const getSelectedAlarm = async () => {
  const alarm_profiles = await AsyncStorage.getItem('alarm_profiles');
  const selected_alarm_id = AsyncStorage.getItem('selected_alarm_id');
  const alarms = JSON.parse(alarm_profiles || '[]');
  const selectedId = Number(selected_alarm_id);

  if (!alarms.length) return null;

  return alarms.find(a => a.id === selectedId) || alarms[0];
};

export const getAlarmNumber = async () => {
  const alarm = await getSelectedAlarm();
  if (!alarm) return null;

  return alarm.number;
};

export const getAlarmPassword = async () => {
  const alarm = await getSelectedAlarm();
  if (!alarm) return null;

  return alarm.password;
};

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const sleepConnection = (ms, signal) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error('Connection cancelled'));
    };

    if (signal?.aborted) {
      clearTimeout(timer);
      reject(new Error('Connection cancelled'));
      return;
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
};

let connectingTask = null;
let connectionAbortController = null;

export const connectUntilSuccess = async (address, dispatch) => {
  // Cancel previous connection attempt
  if (connectionAbortController) {
    connectionAbortController.abort();
  }

  connectionAbortController = new AbortController();

  const signal = connectionAbortController.signal;

  connectingTask = (async () => {
    try {
      while (store.getState().connection === 'connecting' && !signal.aborted) {
        try {
          // -----------------------------------------
          // Check if already connected
          // -----------------------------------------

          const connected = await RNBluetoothClassic.isDeviceConnected(address);

          if (signal.aborted) {
            break;
          }

          if (connected) {
            console.log('Already connected:', address);

            await dispatch(changeConnection('connected'));
            break;
          }

          // -----------------------------------------
          // Attempt connection
          // -----------------------------------------

          console.log('Attempting to connect:', address);

          await RNBluetoothClassic.connectToDevice(address, {
            delimiter: '',
            connectionType: 'binary',
          });

          if (signal.aborted) {
            break;
          }

          // -----------------------------------------
          // Verify connection
          // -----------------------------------------

          const verified = await RNBluetoothClassic.isDeviceConnected(address);

          if (signal.aborted) {
            break;
          }

          if (verified) {
            console.log('Connected:', address);

            await dispatch(changeConnection('connected'));
            break;
          }

          console.log('connectToDevice returned, but device is not connected.');
        } catch (err) {
          if (signal.aborted) {
            break;
          }

          console.log(`Connection failed for ${address}:`, err);
        }

        // -----------------------------------------
        // Check state before retry
        // -----------------------------------------

        if (signal.aborted || store.getState().connection !== 'connecting') {
          break;
        }

        try {
          await sleepConnection(3000, signal);
        } catch {
          break;
        }
      }
    } finally {
      // Only clear the task if this is still
      // the current controller.
      if (connectionAbortController?.signal === signal) {
        connectionAbortController = null;
        connectingTask = null;
      }
    }
  })();

  return connectingTask;
};

export const cancelConnection = async dispatch => {
  if (connectionAbortController) {
    connectionAbortController.abort();
    connectionAbortController = null;
  }

  if (connectingTask) {
    try {
      await connectingTask;
    } catch {
      // Ignore cancellation errors
    }

    connectingTask = null;
  }

  await dispatch(changeConnection('disconnected'));
};

export const getSelectedMacAddress = async () => {
  let addresses = await AsyncStorage.getItem(STORAGE_KEYS.macAddresses);
  addresses = JSON.parse(addresses || '[]');

  let addressId = await AsyncStorage.getItem(STORAGE_KEYS.macAddress);
  addressId = parseInt(addressId);
  return addresses.find(ad => ad.id === addressId)?.address;
};

export const getSelectedMacAddressPassword = async () => {
  let addresses = await AsyncStorage.getItem(STORAGE_KEYS.macAddresses);
  addresses = JSON.parse(addresses || '[]');

  let addressId = await AsyncStorage.getItem(STORAGE_KEYS.macAddress);
  addressId = parseInt(addressId);
  return addresses.find(ad => ad.id === addressId)?.password;
};

export const createCommand = async (op_code, vars) => {
  const alarmPassword = await getAlarmPassword();
  let command = `${FIX_TEXT}*${alarmPassword}*${op_code}`;
  for (let i = 0; i < vars.length; i++) {
    command += `*${vars[i]}`;
  }
  command += '#';
  return command;
};

export const numberToHex = (num, bytes) => {
  return Number(num)
    .toString(16)
    .padStart(bytes * 2, '0');
};

const base64ToBytes = base64 => {
  const binaryString = base64Decode(base64);

  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
};

export const bytesToHex = bytes => {
  console.log('bytes:', bytes);
  console.log('bytes length:', bytes.length);

  const hex = Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  console.log('hex:', hex);
  console.log('hex length:', hex.length);

  return hex;
};

export const hexToBytes = hex => {
  hex = hex.replace(/\s+/g, '');
  console.log('hex:', hex);
  console.log('hex length:', hex.length);
  const bytes = new Uint8Array(hex.length / 2);
  console.log('bytes length:', bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }

  return bytes;
};

// export const createBluetoothCommand = async (op_code, vars) => {
//   const alarmPassword = parseInt(await getAlarmPassword());
//   const passwordHex = numberToHex(alarmPassword, 3);
//   const opCodeHex = numberToHex(op_code, 2);
//   let varsHex = '';
//   for (let i = 0; i < 10; i++) {
//     const val = vars[i] !== undefined ? vars[i] : 0;
//     varsHex += numberToHex(val, 8);
//   }

//   const payload = passwordHex + opCodeHex + varsHex;
//   let sum = 0;
//   for (let i = 0; i < payload.length; i += 2) {
//     sum += parseInt(payload.substring(i, i + 2), 16);
//   }

//   // چک‌سام ۲ بایتی (ماندن در محدوده 0xFFFF)
//   const checksumHex = (sum & 0xffff).toString(16).padStart(4, '0');

//   // نتیجه نهایی (رشته هگزادسیمال)
//   const finalHex = payload + checksumHex;

//   // تبدیل رشته هگز به Uint8Array (برای ارسال از طریق بلوتوث)
//   const byteArray = new Uint8Array(
//     finalHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)),
//   );

//   return byteArray;
// };

const toLittleEndian = hex => {
  return hex.match(/../g).reverse().join('');
};

export const createBluetoothCommand = async (op_code, vars) => {
  const bluetoothPassword = parseInt(await getSelectedMacAddressPassword());
  console.log("bluetooth password:", bluetoothPassword);

  // Convert each field to little-endian
  const passwordHex = toLittleEndian(numberToHex(bluetoothPassword, 3));
  const opCodeHex = toLittleEndian(numberToHex(op_code, 2));

  let varsHex = '';
  for (let i = 0; i < 10; i++) {
    const val = vars[i] !== undefined ? vars[i] : 0;
    varsHex += toLittleEndian(numberToHex(val, 8));
  }

  const payload = passwordHex + opCodeHex + varsHex;

  // Calculate checksum on transmitted bytes
  let sum = 0;
  for (let i = 0; i < payload.length; i += 2) {
    sum += parseInt(payload.substring(i, i + 2), 16);
  }

  // 8-bit checksum
  const checksum = sum & 0xff;

  // 1-byte checksum (endianness doesn't apply)
  const checksumHex = numberToHex(checksum, 1);

  const finalHex = payload + checksumHex;

  return new Uint8Array(
    finalHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)),
  );
};

export const sendAndWaitForBluetoothResponse = (
  address,
  data,
  signal,
  timeout = 30000,
) => {
  return new Promise(async (resolve, reject) => {
    let subscription;

    const cleanup = () => {
      clearTimeout(timer);
      subscription?.remove?.();
      signal?.removeEventListener?.('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new Error('Operation cancelled'));
    };

    if (signal?.aborted) {
      return reject(new Error('Operation cancelled'));
    }

    signal?.addEventListener?.('abort', onAbort);

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Response timeout'));
    }, timeout);

    try {
      const device = await RNBluetoothClassic.getConnectedDevice(address);

      subscription = device.onDataReceived(event => {
        cleanup();
        console.log('onDataReceived event:', event);
        console.log('onDataReceived:', event.data);
        const bytes = base64ToBytes(event.data);

        console.log('Received bytes:', bytes);
        console.log('Length:', bytes.length);
        resolve(bytes);
      });

      await device.write(data);
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
};

export const bluetoothCommandValidation = bytes => {
  const EXPECTED_SIZE = 168;

  //-----------------------------------------
  // Size validation
  //-----------------------------------------

  if (bytes.length !== EXPECTED_SIZE) return false;

  //-----------------------------------------
  // Checksum validation
  //-----------------------------------------

  let sum = 0;

  for (let i = 0; i < EXPECTED_SIZE - 1; i++) {
    sum += bytes[i];
  }

  const calculatedChecksum = sum & 0xff;
  console.log('calculated checksum:', calculatedChecksum);
  const receivedChecksum = bytes[EXPECTED_SIZE - 1];
  console.log('received checksum:', receivedChecksum);

  if (calculatedChecksum !== receivedChecksum) return false;

  //-----------------------------------------
  // Everything is valid
  //-----------------------------------------

  return true;
};

export const bluetoothResponseValidation = (response, expectedOpcode) => {
  // -----------------------------------------
  // Convert to Uint8Array if necessary
  // -----------------------------------------

  const bytes =
    response instanceof Uint8Array ? response : new Uint8Array(response);

  // -----------------------------------------
  // Validate size
  // -----------------------------------------

  if (bytes.length !== 3) {
    return {
      valid: false,
      reason: 'INVALID_LENGTH',
      message: `Invalid response length. Expected 3 bytes, received ${bytes.length}.`,
    };
  }

  const [opcode, status, receivedChecksum] = bytes;

  // -----------------------------------------
  // Validate operation code
  // -----------------------------------------
  const expected = Number(expectedOpcode);
  const received = Number(opcode);

  if (received !== expected) {
    return {
      valid: false,
      reason: 'INVALID_OPCODE',
      expectedOpcode,
      receivedOpcode: opcode,
      message: 'The response operation code does not match the request.',
    };
  }

  // -----------------------------------------
  // Validate checksum
  // -----------------------------------------

  const calculatedChecksum = (opcode + status) & 0xff;

  if (receivedChecksum !== calculatedChecksum) {
    return {
      valid: false,
      reason: 'INVALID_CHECKSUM',
      calculatedChecksum,
      receivedChecksum,
      message: 'The response checksum is invalid.',
    };
  }

  // -----------------------------------------
  // Validate status
  // -----------------------------------------

  if (status !== 1) {
    return {
      valid: false,
      reason: 'COMMAND_FAILED',
      status,
      message: 'The device rejected the command.',
    };
  }

  // -----------------------------------------
  // Everything is valid
  // -----------------------------------------

  return {
    valid: true,
    opcode,
    status,
    checksum: receivedChecksum,
  };
};

export const parseDeviceDate = str => {
  const monthMap = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  const parts = str.split(' ');
  console.log(parts);

  const day = parts[2].padStart(2, '0');
  console.log('day:', day);
  const month = String(monthMap[parts[1]]).padStart(2, '0');
  console.log('month:', month);
  const year = parts[3].slice(-2);
  console.log('year:', year);

  const [h, m, s] = parts[4].split(':');
  console.log(h, m, s);

  return {
    formattedTime: `${h}${m}${s}`,
    formattedDate: `${year}${month}${day}`,
  };
};
