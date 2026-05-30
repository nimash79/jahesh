import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { createCommand, getAlarmNumber } from '../utils/helper';
import { COLORS, OPCODE } from '../utils/constants';
import { notif_error, notif_success } from '../utils/toast';
import { createMem } from '../memory';
import { updateMemory } from '../reducers/memoryReducer';
import CustomAccordion from '../components/shared/CustomAccordion';
import PowerIcon from './../components/icons/PowerIcon';
import LobymanIcon from './../components/icons/LobymanIcon';
import PhoneIcon from './../components/icons/PhoneIcon';
import MainLayout from '../layouts/MainLayout';
import CustomPicker from '../components/shared/CustomPicker';
import CustomDropdown from '../components/shared/CustomDropdown';
import CustomSaveButton from '../components/shared/CustomSaveButton';
import CustomButton from '../components/shared/CustomButton';
import LockIcon from '../components/icons/LockIcon';
import UnlockIcon from '../components/icons/UnlockIcon';
import CustomInput from '../components/shared/CustomInput';
import LockToggle from '../components/LockToggle';

const STORAGE_KEYS = {
  alarmNumber: 'alarm_number',
  alarmPassword: 'alarm_password',
  deviceStatus: 'home_device_status',
  relayStatus: 'home_relay_status',
  relayNumber: 'home_relay_number',
  alarmProfiles: 'alarm_profiles',
};

const HomeScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { sendMethod, memory } = useSelector(s => s);

  const [deviceStatus, setDeviceStatus] = useState(false);
  const [relayStatus, setRelayStatus] = useState(false);
  const [relayNumber, setRelayNumber] = useState(1);

  const [alarms, setAlarms] = useState([]);
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);

  const selectedAlarm = useMemo(
    () =>
      alarms.find(a => a.id === selectedAlarmId) || {
        id: null,
        name: '',
        number: '',
        password: '',
      },
    [alarms, selectedAlarmId],
  );

  // ---------- LOADING ----------
  useEffect(() => {
    (async () => {
      const savedDeviceStatus = await AsyncStorage.getItem(
        STORAGE_KEYS.deviceStatus,
      );
      if (savedDeviceStatus !== null)
        setDeviceStatus(savedDeviceStatus === 'true');

      const savedRelayStatus = await AsyncStorage.getItem(
        STORAGE_KEYS.relayStatus,
      );
      if (savedRelayStatus !== null)
        setRelayStatus(savedRelayStatus === 'true');

      const savedRelayNumber = await AsyncStorage.getItem(
        STORAGE_KEYS.relayNumber,
      );
      if (savedRelayNumber !== null) setRelayNumber(Number(savedRelayNumber));

      let savedAlarmsStr = await AsyncStorage.getItem(
        STORAGE_KEYS.alarmProfiles,
      );
      let savedAlarms = savedAlarmsStr ? JSON.parse(savedAlarmsStr) : null;

      if (!savedAlarms || !Array.isArray(savedAlarms) || !savedAlarms.length) {
        let legacyNumber =
          (await AsyncStorage.getItem(STORAGE_KEYS.alarmNumber)) || '123456789';
        let legacyPassword =
          (await AsyncStorage.getItem(STORAGE_KEYS.alarmPassword)) || '1234';

        savedAlarms = [
          {
            id: 1,
            name: t('homePage:default_alarm_name', { defaultValue: 'Alarm 1' }),
            number: legacyNumber,
            password: legacyPassword,
          },
        ];

        await AsyncStorage.setItem(
          STORAGE_KEYS.alarmProfiles,
          JSON.stringify(savedAlarms),
        );
      }

      setAlarms(savedAlarms);
      setSelectedAlarmId(savedAlarms[0].id);
    })();
  }, []);

  // ---------- SYNC STORAGE ----------
  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.deviceStatus,
        String(deviceStatus),
      );
    })();
  }, [deviceStatus]);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.relayStatus, String(relayStatus));
    })();
  }, [relayStatus]);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.relayNumber, String(relayNumber));
    })();
  }, [relayNumber]);

  const persistAlarms = async nextAlarms => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.alarmProfiles,
      JSON.stringify(nextAlarms),
    );
    setAlarms(nextAlarms);
  };

  const saveSelectedAlarm = () => {
    if (!selectedAlarmId) return;

    const idx = alarms.findIndex(a => a.id === selectedAlarmId);
    if (idx === -1) return;

    const alarm = alarms[idx];

    if (!alarm.number || !alarm.password) {
      notif_error(t('homePage:validation'));
      return;
    }

    const nextAlarms = [...alarms];
    nextAlarms[idx] = { ...alarm };
    persistAlarms(nextAlarms);
    notif_success(t('common:success'));
  };

  const addAlarm = () => {
    const nextId = (alarms.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;

    const newAlarm = {
      id: nextId,
      name:
        t('homePage:default_alarm_name_with_index', {
          index: nextId,
          defaultValue: `Alarm ${nextId}`,
        }) || `Alarm ${nextId}`,
      number: '',
      password: '',
    };

    const nextAlarms = [...alarms, newAlarm];
    persistAlarms(nextAlarms);
    setSelectedAlarmId(newAlarm.id);
  };

  const removeSelectedAlarm = () => {
    if (alarms.length <= 1) {
      notif_error(t('homePage:at_least_one_alarm'));
      return;
    }

    const nextAlarms = alarms.filter(a => a.id !== selectedAlarmId);
    persistAlarms(nextAlarms);
    setSelectedAlarmId(nextAlarms[0]?.id || null);
  };

  const currentAlarmNumberForSms = selectedAlarm.number || getAlarmNumber();

  // --- Memory update from redux ---
  useEffect(() => {
    setDeviceStatus(memory.device_state.locked);
    setRelayStatus(memory.device_state.relays[relayNumber - 1]);
  }, [memory, relayNumber]);

  // ---------- SAVE DEVICE STATUS ----------
  const saveDeviceStatus = async () => {
    if (sendMethod === 'sms') {
      const vars = [deviceStatus ? 0 : 1];
      const command = await createCommand(OPCODE.DEVICE_STATUS, vars);
      Linking.openURL(
        `sms:${currentAlarmNumberForSms}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.device_state.locked = deviceStatus;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  // ---------- SAVE RELAY ----------
  const saveRelayStatus = async () => {
    if (sendMethod === 'sms') {
      const vars = [relayNumber, relayStatus ? 0 : 1];
      const command = await createCommand(OPCODE.RELAY_STATUS, vars);
      Linking.openURL(
        `sms:${currentAlarmNumberForSms}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.device_state[`relay${relayNumber}`] = relayStatus;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        <CustomAccordion title={t('homePage:device_status')} Icon={PowerIcon}>
          <LockToggle
            locked={!deviceStatus}
            onToggle={() => setDeviceStatus(p => !p)}
          />

          <CustomSaveButton onPress={saveDeviceStatus} />
        </CustomAccordion>

        <CustomAccordion title={t('homePage:relays_status')} Icon={LobymanIcon}>
          <CustomPicker
            containerStyle={{ marginBottom: 16 }}
            selectedValue={relayNumber}
            onValueChange={setRelayNumber}
            options={[
              { label: t('homePage:relay_number', { number: 1 }), value: 1 },
              { label: t('homePage:relay_number', { number: 2 }), value: 2 },
              { label: t('homePage:relay_number', { number: 3 }), value: 3 },
              { label: t('homePage:relay_number', { number: 4 }), value: 4 },
              { label: t('homePage:relay_number', { number: 5 }), value: 5 },
              { label: t('homePage:relay_number', { number: 6 }), value: 6 },
              { label: t('homePage:relay_number', { number: 7 }), value: 7 },
              { label: t('homePage:relay_number', { number: 8 }), value: 8 },
            ]}
          />

          {/* <CustomDropdown
            value={relayNumber}
            setValue={setRelayNumber}
            containerStyle={{ marginBottom: 16 }}
            options={[
              { label: t('homePage:relay_number', { number: 1 }), value: 1 },
              { label: t('homePage:relay_number', { number: 2 }), value: 2 },
              { label: t('homePage:relay_number', { number: 3 }), value: 3 },
              { label: t('homePage:relay_number', { number: 4 }), value: 4 },
              { label: t('homePage:relay_number', { number: 5 }), value: 5 },
              { label: t('homePage:relay_number', { number: 6 }), value: 6 },
              { label: t('homePage:relay_number', { number: 7 }), value: 7 },
              { label: t('homePage:relay_number', { number: 8 }), value: 8 },
            ]}
          /> */}

          <View style={styles.dual_button}>
            <CustomButton
              text={t('homePage:off')}
              onPress={() => setRelayStatus(false)}
              style={
                relayStatus
                  ? styles.lockOutline
                  : { width: '45%', backgroundColor: COLORS.error }
              }
              textStyle={relayStatus ? { color: COLORS.error } : null}
            />

            <CustomButton
              text={t('homePage:on')}
              onPress={() => setRelayStatus(true)}
              style={
                !relayStatus
                  ? styles.unlockOutline
                  : { width: '45%', backgroundColor: COLORS.success2 }
              }
              textStyle={!relayStatus ? { color: COLORS.success2 } : null}
            />
          </View>

          <CustomSaveButton onPress={saveRelayStatus} />
        </CustomAccordion>

        <CustomAccordion title={t('homePage:alarm_number')} Icon={PhoneIcon}>

          <CustomPicker
            selectedValue={selectedAlarmId}
            onValueChange={v => setSelectedAlarmId(v)}
            options={alarms.map(a => ({ label: a.name, value: a.id }))}
            containerStyle={{ marginBottom: 16 }}
          />

          <View style={[styles.row, { marginBottom: 16 }]}>
            <CustomButton
              onPress={addAlarm}
              text={t('homePage:add_alarm')}
              style={{ flex: 1, marginInlineStart: 8, marginInlineEnd: 8 }}
            />
            <CustomButton
              onPress={removeSelectedAlarm}
              text={t('homePage:remove_alarm')}
              style={{ flex: 1, backgroundColor: COLORS.error }}
            />
          </View>

          <CustomInput
            style={styles.input}
            placeholder={t('homePage:alarm_name_placeholder')}
            value={selectedAlarm.name}
            onChangeText={name =>
              setAlarms(prev =>
                prev.map(a => (a.id === selectedAlarmId ? { ...a, name } : a)),
              )
            }
          />
          <CustomInput
            style={styles.input}
            placeholder={t('homePage:phone_placeholder')}
            keyboardType="phone-pad"
            value={selectedAlarm.number}
            onChangeText={number =>
              setAlarms(prev =>
                prev.map(a =>
                  a.id === selectedAlarmId ? { ...a, number } : a,
                ),
              )
            }
          />
          <CustomInput
            style={styles.input}
            placeholder={t('homePage:password_placeholder')}
            secureTextEntry
            value={selectedAlarm.password}
            onChangeText={password =>
              setAlarms(prev =>
                prev.map(a =>
                  a.id === selectedAlarmId ? { ...a, password } : a,
                ),
              )
            }
          />

          <CustomSaveButton onPress={saveSelectedAlarm} />
        </CustomAccordion>
      </View>
    </MainLayout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accordion: { marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 8 },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: { fontSize: 16, fontWeight: 'bold' },
  accordionContent: { marginTop: 12 },
  lockToggle: { alignItems: 'center', marginBottom: 16 },
  dropdownBox: { borderWidth: 1, borderRadius: 8, marginBottom: 12 },
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
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 12,
  },
});
