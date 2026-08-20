import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

import {
  bluetoothResponseValidation,
  bytesToHex,
  createBluetoothCommand,
  createCommand,
  formatTimeToHHmmss,
  getAlarmNumber,
  getSelectedMacAddress,
  parseDeviceDate,
  sendAndWaitForBluetoothResponse,
  toMiladiYYMMDD,
} from '../utils/helper';
import { COLORS, OPCODE } from '../utils/constants';
import { createMem } from '../memory';
import { updateMemory } from '../reducers/memoryReducer';
import { notif_error, notif_success } from '../utils/toast';
import CustomAccordion from '../components/shared/CustomAccordion';
import MainLayout from '../layouts/MainLayout';
import TimeIcon from './../components/icons/TimeIcon';
import AlarmIcon from './../components/icons/AlarmIcon';
import TestIcon from './../components/icons/TestIcon';
import CustomInput from '../components/shared/CustomInput';
import CustomSaveButton from '../components/shared/CustomSaveButton';
import CustomButton from '../components/shared/CustomButton';
import CustomPicker from '../components/shared/CustomPicker';
import DoubleSecureIcon from './../components/icons/DoubleSecureIcon';
import PasswordIcon from './../components/icons/PasswordIcon';
import { Calendar } from 'react-native-general-calendars';
import { CustomDatePicker } from '../components/shared/CustomDatePicker';
import CustomText from '../components/shared/CustomText';
import RemoteIcon from './../components/icons/RemoteIcon';
import ZoneIcon from './../components/icons/ZoneIcon';
import TimerIcon from './../components/icons/TimerIcon';
import PowerIcon from './../components/icons/PowerIcon';
import CustomLoadingModal from '../components/modals/CustomLoadingModal';
import MemoryDesign from './../memory/MemoryDesign';
import RelayIcon from '../components/icons/RelayIcon';
import SilentIcon from './../components/icons/SilentIcon';
import { MemDesign } from '../memory/MemDesign';

const DeviceScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const memory = useSelector(state => state.memory);
  const sendMethod = useSelector(state => state.sendMethod);

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('loading');
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [menuOldPassword, setMenuOldPassword] = useState();
  const [menuNewPassword, setMenuNewPassword] = useState();
  const [smsOldPassword, setSmsOldPassword] = useState();
  const [smsNewPassword, setSmsNewPassword] = useState();
  const [alarmPeriod, setAlarmPeriod] = useState(1);
  const [alarmPeriodOptions, setAlarmPeriodOptions] = useState([
    { value: 1, label: t('devicePage:minute_number', { number: 1 }) },
    { value: 2, label: t('devicePage:minute_number', { number: 2 }) },
    { value: 3, label: t('devicePage:minute_number', { number: 3 }) },
    { value: 4, label: t('devicePage:minute_number', { number: 4 }) },
    { value: 5, label: t('devicePage:minute_number', { number: 5 }) },
  ]);
  const [systemMode, setSystemMode] = useState(false);
  const [doubleSecureStatus, setDoubleSecureStatus] = useState(false);
  const [doubleSecure, setDoubleSecure] = useState(15);
  const [doubleSecureOptions, setDoubleSecureOptions] = useState([
    { value: 15, label: t('devicePage:second_number', { number: 15 }) },
    { value: 30, label: t('devicePage:second_number', { number: 30 }) },
    { value: 45, label: t('devicePage:second_number', { number: 45 }) },
    { value: 60, label: t('devicePage:second_number', { number: 60 }) },
  ]);
  const [relayNumber, setRelayNumber] = useState();
  const [timerNumber, setTimerNumber] = useState(0);
  const [timerNumberOptions, setTimerNumberOptions] = useState([
    { value: 0, label: t('devicePage:timer_number', { number: 0 }) },
    { value: 1, label: t('devicePage:timer_number', { number: 1 }) },
    { value: 2, label: t('devicePage:timer_number', { number: 2 }) },
    { value: 3, label: t('devicePage:timer_number', { number: 3 }) },
    { value: 4, label: t('devicePage:timer_number', { number: 4 }) },
    { value: 5, label: t('devicePage:timer_number', { number: 5 }) },
    { value: 6, label: t('devicePage:timer_number', { number: 6 }) },
  ]);
  const [timerStatus, setTimerStatus] = useState(1);
  const [timerStatusOptions, setTimerStatusOptions] = useState([
    { value: 1, label: t('devicePage:active') },
    { value: 0, label: t('devicePage:inactive') },
  ]);
  const [timerApplication, setTimerApplication] = useState(1);
  const [timerApplicationOptions, setTimerApplicationOptions] = useState([
    { value: 1, label: t('devicePage:on_relay') },
    { value: 0, label: t('devicePage:off_relay') },
  ]);
  const [timerHour, setTimerHour] = useState();
  const [timerMinute, setTimerMinute] = useState();
  const [timerWeekday, setTimerWeekday] = useState(1);
  const [timerWeekdayOptions, setTimerWeekdayOptions] = useState([
    { value: 0, label: t('devicePage:saturday') },
    { value: 1, label: t('devicePage:sunday') },
    { value: 2, label: t('devicePage:monday') },
    { value: 3, label: t('devicePage:tuesday') },
    { value: 4, label: t('devicePage:wednesday') },
    { value: 5, label: t('devicePage:thursday') },
    { value: 6, label: t('devicePage:friday') },
  ]);
  const [memoryNumberRO, setMemoryNumberRO] = useState(0);
  const [remoteOperation, setRemoteOperation] = useState(false);
  const [remoteOperationData, setRemoteOperationData] = useState(0);
  const [memoryNumberWZO, setMemoryNumberWZO] = useState(0);
  const [WirelessZoneOperationData, setWirelessZoneOperationData] = useState(0);
  const [wirelessZoneOperation, setWirelessZoneOperation] = useState(false);
  const [memoryNumberROOptions, setMemoryNumberROOptions] = useState([
    {
      label: t('devicePage:memory_number', { number: 0 }),
      value: 0,
    },
    {
      label: t('devicePage:memory_number', { number: 1 }),
      value: 1,
    },
    {
      label: t('devicePage:memory_number', { number: 2 }),
      value: 2,
    },
    {
      label: t('devicePage:memory_number', { number: 3 }),
      value: 3,
    },
    {
      label: t('devicePage:memory_number', { number: 4 }),
      value: 4,
    },
    {
      label: t('devicePage:memory_number', { number: 5 }),
      value: 5,
    },
    {
      label: t('devicePage:memory_number', { number: 6 }),
      value: 6,
    },
    {
      label: t('devicePage:memory_number', { number: 7 }),
      value: 7,
    },
    {
      label: t('devicePage:memory_number', { number: 8 }),
      value: 8,
    },
    {
      label: t('devicePage:memory_number', { number: 9 }),
      value: 9,
    },
  ]);
  const [memoryNumberWZOOptions, setMemoryNumberWZOOptions] = useState([
    {
      label: t('devicePage:memory_number', { number: 0 }),
      value: 0,
    },
    {
      label: t('devicePage:memory_number', { number: 1 }),
      value: 1,
    },
    {
      label: t('devicePage:memory_number', { number: 2 }),
      value: 2,
    },
    {
      label: t('devicePage:memory_number', { number: 3 }),
      value: 3,
    },
    {
      label: t('devicePage:memory_number', { number: 4 }),
      value: 4,
    },
  ]);
  const [relayNumberMode, setRelayNumberMode] = useState(0);
  const [relayMode, setRelayMode] = useState(0);
  const [delay, setDelay] = useState(0);

  const [silentMode, setSilentMode] = useState(false);

  const abortController = useRef(null);

  useEffect(() => {
    if (memory.bytes.length == 168) {
      const mem = new MemDesign(memory.bytes);
      // CURRENT DATE AND TIME
      const { Year, Month, Date: date } = mem.current_date;
      const { Hours, Minutes } = mem.current_time;
      const fullYear = 2000 + Year;

      const isValidDate =
        Number.isInteger(Year) &&
        Number.isInteger(Month) &&
        Number.isInteger(date) &&
        Number.isInteger(Hours) &&
        Number.isInteger(Minutes) &&
        Year >= 0 &&
        Year <= 99 &&
        fullYear >= 2000 &&
        fullYear <= 2099 &&
        Month >= 1 &&
        Month <= 12 &&
        date >= 1 &&
        date <= new Date(fullYear, Month, 0).getDate() &&
        Hours >= 0 &&
        Hours <= 23 &&
        Minutes >= 0 &&
        Minutes <= 59;

      if (isValidDate) {
        setDate(new Date(fullYear, Month - 1, date, Hours, Minutes));
      }

      setSystemMode(mem.System_settings.S_Settings.mode > 0);
      setSilentMode(mem.System_settings.S_Settings.notification_state);
      setAlarmPeriod(mem.System_settings.S_Settings.period_time);
      setDoubleSecureStatus(
        mem.System_settings.S_Settings.doubl_security_state > 0,
      );
      setDoubleSecure(mem.System_settings.S_Settings.doubl_security_min * 15);
      // RELAY MODE
      setRelayMode(mem.relay_setting.relay_mode);
      setDelay(mem.relay_setting.relay_time);
      // REMOTE OPERATION
      setRemoteOperationData(mem.Rf_mem[memoryNumberRO].Remote_.address_code);
      // WIRELESS ZONE OPERATION
      setWirelessZoneOperationData(mem.rf_zone[memoryNumberWZO].Data);
      // RELAY TIMER
      setRelayNumber(mem.timers[timerNumber].relay_num);
      setTimerStatus(mem.timers[timerNumber].timer);
      setTimerApplication(mem.timers[timerNumber].state_);
      setTimerHour(mem.timers[timerNumber].hours);
      setTimerMinute(mem.timers[timerNumber].min);
      setTimerWeekday(mem.timers[timerNumber].weekday);
      // PASSWORDS
      setMenuOldPassword(mem.Passwords.menu_pass);
      setSmsOldPassword(mem.Passwords.tell_pass);
    }
  }, [memory, memoryNumberRO, memoryNumberWZO, timerNumber]);

  const saveTimeSettings = async () => {
    const { formattedTime, formattedDate } = parseDeviceDate(date.toString());
    const vars = [formattedTime, formattedDate];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.TIME_SETTINGS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.TIME_SETTINGS,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.TIME_SETTINGS,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    }
  };

  const saveAlarmPeriod = async () => {
    const vars = [alarmPeriod];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.ALARM_PERIOD, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.ALARM_PERIOD,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.ALARM_PERIOD,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.system_settings.S_Settings.period_time = alarmPeriod;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveSystemMode = async () => {
    const vars = [systemMode ? '1' : '0'];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.SYSTEM_MODE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(OPCODE.SYSTEM_MODE, vars);
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.SYSTEM_MODE,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.system_settings.S_Settings.mode = systemMode ? 1 : 0;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveTest = async type => {
    const vars = [type];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.TEST, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(OPCODE.TEST, vars);
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(response, OPCODE.TEST);

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    }
  };

  const saveDoubleSecure = async () => {
    const vars = [doubleSecureStatus ? 1 : 0, doubleSecure];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.DOUBLE_SECURE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.DOUBLE_SECURE,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.DOUBLE_SECURE,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.system_settings.S_Settings.double_security_state =
        doubleSecureStatus;
      newMemory.system_settings.S_Settings.double_security_min =
        doubleSecure / 15;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveMenuPassword = async () => {
    const vars = [menuOldPassword, menuNewPassword];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.PASSWORD_MENU, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.PASSWORD_MENU,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.PASSWORD_MENU,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.passwords.menu_pass = menuNewPassword;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveSmsPassword = async () => {
    const vars = [smsOldPassword, smsNewPassword];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.PASSWORD_SMS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.PASSWORD_SMS,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.PASSWORD_SMS,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.passwords.tell_pass = smsNewPassword;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveRelayTimer = async () => {
    if (relayNumber == null || !timerHour || !timerMinute) {
      notif_error(t('common:error'), t('devicePage:timer_validation'));
      return;
    }
    if (relayNumber < 0 || relayNumber > 99) {
      notif_error(t('common:error'), t('devicePage:relay_validation'));
      return;
    }
    if (
      timerHour < 0 ||
      timerHour > 24 ||
      timerMinute < 0 ||
      timerMinute > 59
    ) {
      notif_error(t('common:error'), t('devicePage:time_validation'));
      return;
    }
    var settings = '';
    settings += timerStatus ? '1' : '0';
    settings += timerApplication ? '1' : '0';
    const vars = [
      relayNumber,
      timerNumber,
      timerHour,
      timerMinute,
      timerWeekday,
      settings,
    ];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.SET_TIMER_RELAYS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.SET_TIMER_RELAYS,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.SET_TIMER_RELAYS,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      // TODO
    }
  };

  const saveRemoteOperation = async () => {
    if (memoryNumberRO == null || memoryNumberRO < 0 || memoryNumberRO > 9) {
      notif_error(t('common:error'), t('devicePage:remote_validation'));
      return;
    }
    const vars = [remoteOperation ? '1' : '0', memoryNumberRO];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.SET_REMOTE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(OPCODE.SET_REMOTE, vars);
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.SET_REMOTE,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      // TODO
    }
  };

  const saveWirelessZoneOperation = async () => {
    if (memoryNumberWZO == null || memoryNumberWZO < 0 || memoryNumberWZO > 4) {
      notif_error(t('common:error'), t('devicePage:wirelesszone_validation'));
      return;
    }
    const vars = [wirelessZoneOperation ? '1' : '0', memoryNumberWZO];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.SET_WIRELESS_ZONE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(
        OPCODE.SET_WIRELESS_ZONE,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.SET_WIRELESS_ZONE,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      // TODO
    }
  };

  const saveRelayMode = async () => {
    // relay validation
    if (
      relayNumberMode == null ||
      relayNumberMode < 0 ||
      relayNumberMode > 99
    ) {
      notif_error(t('common:error'), t('homePage:relay_validation'));
      return;
    }
    // delay validation
    if (relayMode === 1 && (delay == null || delay < 0 || delay > 255)) {
      notif_error(t('common:error'), t('homePage:delay_validation'));
      return;
    }
    const vars = [relayNumberMode, relayMode, relayMode === 0 ? 0 : delay];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.RELAY_MODE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(OPCODE.RELAY_MODE, vars);
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.RELAY_MODE,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      // TODO
    }
  };

  const saveSilentMode = async () => {
    const vars = [silentMode ? '1' : '0'];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.SILENT_MODE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else if (sendMethod === 'bluetooth') {
      const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
      if (!isEnabled) {
        notif_error(t('common:error'), t('common:bluetooth_notEnabled'));
        return;
      }
      const selectedMacAddressValue = await getSelectedMacAddress();
      const isConnected = await RNBluetoothClassic.isDeviceConnected(
        selectedMacAddressValue,
      );
      if (!isConnected) {
        notif_error(t('common:error'), t('common:bluetooth_notConnected'));
        return;
      }
      const dataToSend = await createBluetoothCommand(OPCODE.SILENT_MODE, vars);
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.SILENT_MODE,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
      } catch (err) {
        console.log('err:', err);
        // if (err == 'Error: Response timeout')
        //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
        // else if (err == 'Error: Operation cancelled')
        //   notif_success(t('common:success', t('common:success_cancel')));
        setLoadingStatus('error');
      }
    } else {
      // TODO
    }
  };

  return (
    <MainLayout>
      <CustomLoadingModal
        loading={loading}
        onCancel={() => abortController.current?.abort()}
        status={loadingStatus}
        close={() => setLoading(false)}
      />
      <View style={styles.container}>
        <CustomAccordion title={t('devicePage:time_settings')} Icon={TimeIcon}>
          <View style={{ direction: 'ltr' }}>
            <CustomDatePicker value={date} setValue={setDate} />
          </View>
          {/* <CustomInput
            placeholder="YYYY/MM/DD"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
          <CustomInput
            placeholder="HH:mm:ss"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          /> */}
          <CustomSaveButton onPress={saveTimeSettings} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:relay_timer')} Icon={TimerIcon}>
          <CustomPicker
            selectedValue={timerNumber}
            onValueChange={setTimerNumber}
            options={timerNumberOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>
            {t('devicePage:timer_status')}
          </CustomText>
          <CustomPicker
            selectedValue={timerStatus}
            onValueChange={setTimerStatus}
            options={timerStatusOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>
            {t('devicePage:relay_number')}
          </CustomText>
          <CustomInput
            keyboardType="numeric"
            value={relayNumber?.toString()}
            placeholder={t('devicePage:relay_number')}
            onChangeText={setRelayNumber}
            style={{ marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>
            {t('devicePage:timer_application')}
          </CustomText>
          <CustomPicker
            selectedValue={timerApplication}
            onValueChange={setTimerApplication}
            options={timerApplicationOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>
            {t('devicePage:timer_time')}
          </CustomText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              direction: 'ltr',
              marginBottom: 16,
            }}
          >
            <CustomInput
              keyboardType="numeric"
              value={timerHour?.toString()}
              placeholder={t('devicePage:timer_hour')}
              onChangeText={setTimerHour}
              style={{ width: '48%' }}
            />
            <CustomInput
              keyboardType="numeric"
              value={timerMinute?.toString()}
              placeholder={t('devicePage:timer_minute')}
              onChangeText={setTimerMinute}
              style={{ width: '48%' }}
            />
          </View>
          <CustomText style={styles.sectionTitle}>
            {t('devicePage:weekday')}
          </CustomText>
          <CustomPicker
            selectedValue={timerWeekday}
            onValueChange={setTimerWeekday}
            options={timerWeekdayOptions}
            containerStyle={{ marginBottom: 16 }}
          />

          <CustomSaveButton onPress={saveRelayTimer} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:alarm_period')} Icon={AlarmIcon}>
          <CustomPicker
            selectedValue={alarmPeriod}
            onValueChange={setAlarmPeriod}
            options={alarmPeriodOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomSaveButton onPress={saveAlarmPeriod} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:test')} Icon={TestIcon}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: 16,
            }}
          >
            <CustomButton
              text={t('devicePage:alarm')}
              style={{ flexBasis: '32%', paddingVertical: 8 }}
              onPress={() => saveTest(0)}
              textStyle={{ fontFamily: 'ChangaOne-Regular' }}
            />
            <CustomButton
              text={t('devicePage:siren')}
              style={{ flexBasis: '32%', paddingVertical: 8 }}
              onPress={() => saveTest(1)}
              textStyle={{ fontFamily: 'ChangaOne-Regular' }}
            />
            <CustomButton
              text={t('devicePage:ding_dong')}
              style={{ flexBasis: '32%', paddingVertical: 8 }}
              onPress={() => saveTest(2)}
              textStyle={{ fontFamily: 'ChangaOne-Regular' }}
            />
            <CustomButton
              text={t('devicePage:tcall')}
              style={{ flexBasis: '32%', paddingVertical: 8 }}
              onPress={() => saveTest(3)}
              textStyle={{ fontFamily: 'ChangaOne-Regular' }}
            />
            <CustomButton
              text={t('devicePage:gcall')}
              style={{ flexBasis: '32%', paddingVertical: 8 }}
              onPress={() => saveTest(4)}
              textStyle={{ fontFamily: 'ChangaOne-Regular' }}
            />
            <CustomButton
              text={t('devicePage:sms')}
              style={{ flexBasis: '32%', paddingVertical: 8 }}
              onPress={() => saveTest(5)}
              textStyle={{ fontFamily: 'ChangaOne-Regular' }}
            />
          </View>
        </CustomAccordion>

        <CustomAccordion
          title={t('devicePage:double_secure')}
          Icon={DoubleSecureIcon}
        >
          <View style={styles.row}>
            <CustomButton
              text={t('devicePage:off')}
              outline={doubleSecureStatus}
              onPress={() => setDoubleSecureStatus(false)}
              style={{ flex: 1 }}
            />
            <CustomButton
              text={t('devicePage:on')}
              outline={!doubleSecureStatus}
              onPress={() => setDoubleSecureStatus(true)}
              style={{ flex: 1 }}
            />
          </View>
          <CustomPicker
            options={doubleSecureOptions}
            selectedValue={doubleSecure}
            onValueChange={setDoubleSecure}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomSaveButton onPress={saveDoubleSecure} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:system_mode')} Icon={PowerIcon}>
          <View style={styles.row}>
            <CustomButton
              text={t('devicePage:full_active')}
              outline={systemMode}
              onPress={() => setSystemMode(false)}
              style={{ flex: 1 }}
            />
            <CustomButton
              text={t('devicePage:semi_active')}
              outline={!systemMode}
              onPress={() => setSystemMode(true)}
              style={{ flex: 1 }}
            />
          </View>
          <CustomSaveButton onPress={saveSystemMode} />
        </CustomAccordion>

        <CustomAccordion
          title={t('devicePage:change_menu_password')}
          Icon={PasswordIcon}
        >
          <CustomInput
            placeholder={t('devicePage:old_password')}
            value={menuOldPassword?.toString()}
            onChangeText={setMenuOldPassword}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomInput
            placeholder={t('devicePage:new_password')}
            onChangeText={setMenuNewPassword}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomSaveButton onPress={saveMenuPassword} />
        </CustomAccordion>

        <CustomAccordion
          title={t('devicePage:change_sms_password')}
          Icon={PasswordIcon}
        >
          <CustomInput
            placeholder={t('devicePage:old_password')}
            value={smsOldPassword?.toString()}
            onChangeText={setSmsOldPassword}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomInput
            placeholder={t('devicePage:new_password')}
            onChangeText={setSmsNewPassword}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomSaveButton onPress={saveSmsPassword} />
        </CustomAccordion>

        <CustomAccordion
          title={t('devicePage:remote_operation')}
          Icon={RemoteIcon}
        >
          <CustomPicker
            selectedValue={memoryNumberRO}
            onValueChange={setMemoryNumberRO}
            options={memoryNumberROOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <View style={styles.dual_button}>
            <CustomButton
              text={t('devicePage:delete')}
              onPress={() => setRemoteOperation(false)}
              style={
                remoteOperation
                  ? styles.lockOutline
                  : { width: '45%', backgroundColor: COLORS.error }
              }
              textStyle={remoteOperation ? { color: COLORS.error } : null}
            />

            <CustomButton
              text={t('devicePage:add')}
              onPress={() => setRemoteOperation(true)}
              style={
                !remoteOperation
                  ? styles.unlockOutline
                  : { width: '45%', backgroundColor: COLORS.success2 }
              }
              textStyle={!remoteOperation ? { color: COLORS.success2 } : null}
            />
          </View>
          <CustomInput
            keyboardType="numeric"
            value={
              Number(remoteOperationData?.toString()) == 0
                ? t("common:empty")
                : remoteOperationData?.toString()
            }
            onChangeText={setRemoteOperationData}
            style={{ marginBottom: 16 }}
          />
          <CustomSaveButton onPress={saveRemoteOperation} />
        </CustomAccordion>

        <CustomAccordion
          title={t('devicePage:wirelesszone_operation')}
          Icon={ZoneIcon}
        >
          <CustomPicker
            selectedValue={memoryNumberWZO}
            onValueChange={setMemoryNumberWZO}
            options={memoryNumberWZOOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <View style={styles.dual_button}>
            <CustomButton
              text={t('devicePage:delete')}
              onPress={() => setWirelessZoneOperation(false)}
              style={
                wirelessZoneOperation
                  ? styles.lockOutline
                  : { width: '45%', backgroundColor: COLORS.error }
              }
              textStyle={wirelessZoneOperation ? { color: COLORS.error } : null}
            />

            <CustomButton
              text={t('devicePage:add')}
              onPress={() => setWirelessZoneOperation(true)}
              style={
                !wirelessZoneOperation
                  ? styles.unlockOutline
                  : { width: '45%', backgroundColor: COLORS.success2 }
              }
              textStyle={
                !wirelessZoneOperation ? { color: COLORS.success2 } : null
              }
            />
          </View>
          <CustomInput
            keyboardType="numeric"
            value={
              Number(WirelessZoneOperationData) == 0
                ? t("common:empty")
                : WirelessZoneOperationData?.toString()
            }
            onChangeText={setWirelessZoneOperationData}
            style={{ marginBottom: 16 }}
          />
          <CustomSaveButton onPress={saveWirelessZoneOperation} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:relay_mode')} Icon={RelayIcon}>
          <CustomInput
            keyboardType="numeric"
            value={relayNumberMode?.toString()}
            onChangeText={setRelayNumberMode}
            style={{ marginBottom: 16 }}
            placeholder={t('devicePage:relay_placeholder')}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <CustomButton
              text={t('devicePage:moment')}
              style={{ flexBasis: '48%' }}
              outline={relayMode != 1}
              onPress={() => setRelayMode(1)}
            />
            <CustomButton
              text={t('devicePage:permanent')}
              style={{ flexBasis: '48%' }}
              outline={relayMode != 0}
              onPress={() => setRelayMode(0)}
            />
          </View>
          <CustomInput
            keyboardType="numeric"
            value={delay?.toString()}
            onChangeText={setDelay}
            style={[
              { marginBottom: 16 },
              relayMode === 1 ? {} : { opacity: 0.5 },
            ]}
            placeholder={t('devicePage:delay')}
            editable={relayMode === 1}
          />
          <CustomSaveButton onPress={saveRelayMode} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:silent_mode')} Icon={SilentIcon}>
          <View style={styles.dual_button}>
            <CustomButton
              text={t('devicePage:off')}
              onPress={() => setSilentMode(false)}
              style={
                silentMode
                  ? styles.lockOutline
                  : { width: '45%', backgroundColor: COLORS.error }
              }
              textStyle={silentMode ? { color: COLORS.error } : null}
            />

            <CustomButton
              text={t('devicePage:on')}
              onPress={() => setSilentMode(true)}
              style={
                !silentMode
                  ? styles.unlockOutline
                  : { width: '45%', backgroundColor: COLORS.success2 }
              }
              textStyle={!silentMode ? { color: COLORS.success2 } : null}
            />
          </View>
          <CustomSaveButton onPress={saveSilentMode} />
        </CustomAccordion>
      </View>
    </MainLayout>
  );
};

export default DeviceScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 15 },
  flex1: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  toggleBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 6,
    alignItems: 'center',
  },
  activeBtn: { backgroundColor: '#bbdefb' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridBtn: {
    width: '30%',
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    paddingBottom: 8,
    borderColor: COLORS.primary,
    borderBottomWidth: 1,
    borderRadius: 4,
    width: '80%',
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  dual_button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lockOutline: {
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: 'transparent',
    width: '45%',
  },
  unlockOutline: {
    borderWidth: 1,
    borderColor: COLORS.success2,
    backgroundColor: 'transparent',
    width: '45%',
  },
});
