import moment from "jalali-moment";
import { FIX_TEXT } from "./constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const twoDigit = (num) => {
  return ("0" + num).slice(-2);
};

export const toShamsi = (date) => {
  moment.locale("fa", { useGregorianParser: true });
  return moment(date).format("YYYY/MM/DD");
};

export const getTime = (date) => {
  moment.locale("fa", { useGregorianParser: true });
  return moment(date).format("hh:mm");
};

export const formatTimeToHHmmss = (timeValue) => {
  if (!timeValue) return "";
  const parts = timeValue.split(":"); // ["HH","mm"] or ["HH","mm","ss"]
  const hh = parts[0].padStart(2, "0");
  const mm = (parts[1] ?? "00").padStart(2, "0");
  const ss = (parts[2] ?? "00").padStart(2, "0");
  return `${hh}${mm}${ss}`;
}

export const toMiladiYYMMDD = (shamsiDate) => {
  return moment(shamsiDate, "jYYYY/jMM/jDD").format("YYMMDD");
}


export const bin4ToHex = (bin4) => {
  if (!/^[01]{4}$/.test(bin4)) throw new Error("Expected exactly 4 bits (e.g. '1010').");
  return parseInt(bin4, 2).toString(16).toUpperCase();
}

export const bin5ToHex = (bin5) => {
  if (!/^[01]{5}$/.test(bin5)) throw new Error("Expected exactly 5 bits (e.g. '10101').");
  return parseInt(bin5, 2).toString(16).toUpperCase().padStart(2, "0");
}

export const binToNumber = (bin) => {
  if (!/^[01]+$/.test(bin)) throw new Error("Expected only 0/1 characters.");
  return parseInt(bin, 2);
}


export const getSelectedAlarm = async () => {
  const alarm_profiles = await AsyncStorage.getItem("alarm_profiles");
  const selected_alarm_id = AsyncStorage.getItem("selected_alarm_id");
  const alarms = JSON.parse(alarm_profiles || "[]");
  const selectedId = Number(selected_alarm_id);

  if (!alarms.length) return null;

  return alarms.find(a => a.id === selectedId) || alarms[0];
};

export const getAlarmNumber = async() => {
  const alarm = await getSelectedAlarm();
  if (!alarm) return null;

  return alarm.number;
};

export const getAlarmPassword = async () => {
  const alarm = await getSelectedAlarm();
  if (!alarm) return null;

  return alarm.password;
};


export const createCommand = async (op_code, vars) => {
  const alarmPassword = await getAlarmPassword();
  let command = `${FIX_TEXT}*${alarmPassword}*${op_code}`;
  for (let i = 0; i < vars.length; i++) {
    command += `*${vars[i]}`;
  }
  command += "#";
  return command;
};

export const parseDeviceDate = (str) => {
  const monthMap = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
  };

  const parts = str.split(" ");
  console.log(parts);

  const day = parts[2].padStart(2, "0");
  console.log("day:", day);
  const month = String(monthMap[parts[1]]).padStart(2, "0");
  console.log("month:", month);
  const year = parts[3].slice(-2);
  console.log("year:", year);

  const [h, m, s] = parts[4].split(":");
  console.log(h, m, s);

  return {
    formattedTime: `${h}${m}${s}`,
    formattedDate: `${year}${month}${day}`
  };
}
