import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';

import {
  createCommand,
  formatTimeToHHmmss,
  getAlarmNumber,
  parseDeviceDate,
  toMiladiYYMMDD,
} from '../utils/helper';
import { COLORS, OPCODE } from '../utils/constants';
import { createMem } from '../memory';
import { updateMemory } from '../reducers/memoryReducer';
import { notif_success } from '../utils/toast';
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

const DeviceScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { sendMethod, memory } = useSelector(state => state);

  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [menuOldPassword, setMenuOldPassword] = useState();
  const [menuNewPassword, setMenuNewPassword] = useState();
  const [smsOldPassword, setSmsOldPassword] = useState();
  const [smsNewPassword, setSmsNewPassword] = useState();
  const [systemModes, setSystemModes] = useState([
    { value: 1, label: '1' },
    { value: 2, label: '2' },
  ]);
  const [alarmPeriod, setAlarmPeriod] = useState(1);
  const [alarmPeriodOptions, setAlarmPeriodOptions] = useState([
    { value: 1, label: t('devicePage:minute_number', { number: 1 }) },
    { value: 2, label: t('devicePage:minute_number', { number: 2 }) },
    { value: 3, label: t('devicePage:minute_number', { number: 3 }) },
    { value: 4, label: t('devicePage:minute_number', { number: 4 }) },
    { value: 5, label: t('devicePage:minute_number', { number: 5 }) },
  ]);
  const [alarmStatus, setAlarmStatus] = useState(false);
  const [systemMode, setSystemMode] = useState(1);
  const [doubleSecureStatus, setDoubleSecureStatus] = useState(false);
  const [doubleSecure, setDoubleSecure] = useState(15);
  const [doubleSecureOptions, setDoubleSecureOptions] = useState([
    { value: 15, label: t('devicePage:second_number', { number: 15 }) },
    { value: 30, label: t('devicePage:second_number', { number: 30 }) },
    { value: 45, label: t('devicePage:second_number', { number: 45 }) },
    { value: 45, label: t('devicePage:second_number', { number: 45 }) },
    { value: 60, label: t('devicePage:second_number', { number: 60 }) },
  ]);

  useEffect(() => {
    setSystemMode(parseInt(memory.system_settings.S_Settings.mode) + 1);
    setAlarmStatus(memory.system_settings.S_Settings.notification_state);
    setAlarmPeriod(memory.system_settings.S_Settings.period_time);
    setDoubleSecureStatus(
      memory.system_settings.S_Settings.double_security_state,
    );
    setDoubleSecure(
      parseInt(memory.system_settings.S_Settings.double_security_min) * 15,
    );
  }, [memory]);

  const saveTimeSettings = async () => {
    const {formattedTime, formattedDate} = parseDeviceDate(date.toString());
    const vars = [formattedTime, formattedDate];
    const command = await createCommand(OPCODE.TIME_SETTINGS, vars);
    const currentAlarmNumber = await getAlarmNumber();
    Linking.openURL(
      `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
    );
  };

  const saveAlarmPeriod = async () => {
    if (sendMethod === 'sms') {
      const vars = [alarmPeriod];
      const command = await createCommand(OPCODE.ALARM_PERIOD, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.system_settings.S_Settings.period_time = alarmPeriod;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveAlarmStatus = async () => {
    if (sendMethod === 'sms') {
      const vars = [alarmStatus ? 1 : 0];
      const command = await createCommand(OPCODE.ALARM_STATUS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.system_settings.S_Settings.notification_state = alarmStatus;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveSystemMode = async () => {
    if (sendMethod === 'sms') {
      const vars = [systemMode - 1];
      const command = await createCommand(OPCODE.SYSTEM_MODE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.system_settings.S_Settings.mode = systemMode - 1;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveTest = async type => {
    const vars = [type];
    const command = await createCommand(OPCODE.TEST, vars);
    const currentAlarmNumber = await getAlarmNumber();
    Linking.openURL(
      `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
    );
  };

  const saveDoubleSecure = async () => {
    if (sendMethod === 'sms') {
      const vars = [doubleSecureStatus ? 1 : 0, doubleSecure];
      const command = await createCommand(OPCODE.DOUBLE_SECURE, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
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
    if (sendMethod === 'sms') {
      const vars = [menuOldPassword, menuNewPassword];
      const command = await createCommand(OPCODE.PASSWORD_MENU, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.passwords.menu_pass = menuNewPassword;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveSmsPassword = async () => {
    if (sendMethod === 'sms') {
      const vars = [smsOldPassword, smsNewPassword];
      const command = await createCommand(OPCODE.PASSWORD_SMS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.passwords.tell_pass = smsNewPassword;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  return (
    <MainLayout>
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

        <CustomAccordion title={t('devicePage:alarm_period')} Icon={AlarmIcon}>
          <CustomPicker
            selectedValue={alarmPeriod}
            onValueChange={setAlarmPeriod}
            options={alarmPeriodOptions}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomSaveButton onPress={saveAlarmPeriod} />
        </CustomAccordion>

        <CustomAccordion title={t('devicePage:alarm_status')} Icon={AlarmIcon}>
          <View style={styles.row}>
            <CustomButton
              text={t('devicePage:off')}
              outline={alarmStatus}
              onPress={() => setAlarmStatus(false)}
              style={{ flex: 1 }}
            />
            <CustomButton
              text={t('devicePage:on')}
              outline={!alarmStatus}
              onPress={() => setAlarmStatus(true)}
              style={{ flex: 1 }}
            />
          </View>
          <CustomSaveButton onPress={saveAlarmStatus} />
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

        <CustomAccordion
          title={t('devicePage:change_menu_password')}
          Icon={PasswordIcon}
        >
          <CustomInput
            placeholder={t('devicePage:old_password')}
            onChange={e => setMenuOldPassword(e.target.value)}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomInput
            placeholder={t('devicePage:new_password')}
            onChange={e => setMenuNewPassword(e.target.value)}
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
            onChange={e => setSmsOldPassword(e.target.value)}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomInput
            placeholder={t('devicePage:new_password')}
            onChange={e => setSmsNewPassword(e.target.value)}
            style={{ marginBottom: 16 }}
            secureTextEntry
          />
          <CustomSaveButton onPress={saveSmsPassword} />
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
});
