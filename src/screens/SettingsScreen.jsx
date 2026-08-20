import { StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

import CustomText from '../components/shared/CustomText';
import MainLayout from '../layouts/MainLayout';
import CustomPicker from '../components/shared/CustomPicker';
import CustomButton from '../components/shared/CustomButton';
import CustomInput from '../components/shared/CustomInput';
import CustomSaveButton from '../components/shared/CustomSaveButton';
import CustomAccordion from '../components/shared/CustomAccordion';
import { COLORS, OPCODE, STORAGE_KEYS } from '../utils/constants';
import BluetoothIcon from '../components/icons/BluetoothIcon';
import {
  cancelConnection,
  connectUntilSuccess,
  createBluetoothCommand,
  sendAndWaitForBluetoothResponse,
} from '../utils/helper';
import { notif_error, notif_success } from '../utils/toast';
import { useDispatch, useSelector } from 'react-redux';
import { changeConnection } from '../reducers/connectionReducer';
import ConnectionIcon from './../components/icons/ConnectionIcon';
import RefreshIcon from './../components/icons/RefreshIcon';
import { backgroundColor } from 'react-native-general-calendars/src/style';
import CustomLoadingModal from './../components/modals/CustomLoadingModal';
import { loadMemory } from '../reducers/memoryReducer';
import LanguageIcon from '../components/icons/LanguageIcon';
import { addLanguage } from '../utils/language_storage';
import SmsAccordionIcon from './../components/icons/SmsAccordionIcon';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('loading');

  const [alarms, setAlarms] = useState([]);
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);

  const [macAddresses, setMacAddresses] = useState([]);
  const [selectedMacAddress, setSelectedMacAddress] = useState();
  const [macAddressName, setMacAddressName] = useState();
  const [macAddressValue, setMacAddressValue] = useState();
  const [macAddressPassword, setMacAddressPassword] = useState();

  const sendMethod = useSelector(state => state.sendMethod);
  const connection = useSelector(state => state.connection);
  const dispatch = useDispatch();

  const abortController = useRef(null);

  const changeLanguage = async lang => {
    await i18n.changeLanguage(lang);
    await addLanguage(lang);
    RNRestart.restart();
  };

  // ---------- LOADING ----------
  useEffect(() => {
    (async () => {
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
            name: t('settingsPage:default_alarm_name', {
              defaultValue: 'Device 1',
            }),
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
      notif_error(t('settingsPage:validation'));
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
        t('settingsPage:default_alarm_name_with_index', {
          index: nextId,
          defaultValue: `Device ${nextId}`,
        }) || `Device ${nextId}`,
      number: '',
      password: '',
    };

    const nextAlarms = [...alarms, newAlarm];
    persistAlarms(nextAlarms);
    setSelectedAlarmId(newAlarm.id);
  };

  const removeSelectedAlarm = () => {
    if (alarms.length <= 1) {
      notif_error(t('settingsPage:at_least_one_alarm'));
      return;
    }

    const nextAlarms = alarms.filter(a => a.id !== selectedAlarmId);
    persistAlarms(nextAlarms);
    setSelectedAlarmId(nextAlarms[0]?.id || null);
  };

  // ---------- LOAD SAVED MAC ADDRESSES --------
  useEffect(() => {
    (async () => {
      const addresses = await AsyncStorage.getItem(STORAGE_KEYS.macAddresses);
      setMacAddresses(JSON.parse(addresses || '[]'));
      const address = await AsyncStorage.getItem(STORAGE_KEYS.macAddress);
      setSelectedMacAddress(parseInt(address));
    })();
  }, []);

  const addMacAddress = async () => {
    await disconnectCurrentConnection();
    await cancelConnection(dispatch);
    const nextId =
      (macAddresses.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;

    const newMacAddress = {
      id: nextId,
      address: '',
      name: t('settingsPage:macAddress_number', { number: nextId }),
      password: 'XXXX',
    };

    const addresses = [...macAddresses];
    addresses.push(newMacAddress);
    await AsyncStorage.setItem(
      STORAGE_KEYS.macAddresses,
      JSON.stringify(addresses),
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.macAddress,
      newMacAddress.id.toString(),
    );

    setMacAddresses(addresses);
    setSelectedMacAddress(newMacAddress.id);
  };

  const removeMacAddress = async () => {
    // if (macAddresses.length <= 1) {
    //   notif_error(t("common:error"), t("settingsPage:removeMacAddress_validation"))
    //   return;
    // }
    await disconnectCurrentConnection();
    await cancelConnection(dispatch);
    const addresses = macAddresses.filter(ad => ad.id !== selectedMacAddress);
    setMacAddresses(addresses);
    await AsyncStorage.setItem(
      STORAGE_KEYS.macAddresses,
      JSON.stringify(addresses),
    );
    await AsyncStorage.removeItem(STORAGE_KEYS.macAddress);
    setSelectedMacAddress(null);

    setMacAddressName();
    setMacAddressValue();
    setMacAddressPassword();

    // select another mac address
    if (addresses.length) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.macAddress,
        addresses[0].id.toString(),
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.macAddress,
        addresses[0].id.toString(),
      );
      setSelectedMacAddress(addresses[0].id);
    }
  };

  useEffect(() => {
    console.log('selectedMacAddress:', selectedMacAddress);
    if (!selectedMacAddress) return;

    const address = macAddresses.find(ad => ad.id === selectedMacAddress);
    console.log('address:', address);
    setMacAddressName(address.name);
    setMacAddressValue(address.address);
    setMacAddressPassword(address.password);

    (async () => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.macAddress,
        selectedMacAddress.toString(),
      );
    })();

    if (sendMethod === 'bluetooth') {
      dispatch(changeConnection('connecting'));
      connectUntilSuccess(address.address, dispatch);
    }
  }, [selectedMacAddress]);

  const saveSelectedMacAddress = async () => {
    if (!macAddressName || !macAddressValue || !macAddressPassword) {
      notif_error(t('common:error'), t('settingsPage:macAddress_validation'));
      return;
    }

    const addresses = [...macAddresses];
    const index = macAddresses.findIndex(ad => ad.id === selectedMacAddress);
    addresses[index].name = macAddressName;
    addresses[index].address = macAddressValue.toUpperCase();
    addresses[index].password = macAddressPassword;
    setMacAddresses(addresses);
    await AsyncStorage.setItem(
      STORAGE_KEYS.macAddresses,
      JSON.stringify(macAddresses),
    );

    notif_success(t('common:success'), t('common:success_save'));

    if (sendMethod === 'bluetooth') {
      dispatch(changeConnection('connecting'));
      connectUntilSuccess(macAddressValue.toUpperCase(), dispatch);
    }
  };

  const disconnectCurrentConnection = async () => {
    try {
      const address = getSelectedMacAddressValue();
      const connected = await RNBluetoothClassic.isDeviceConnected(address);
      console.log('disconnecting from ', address);
      if (connected) await RNBluetoothClassic.disconnectFromDevice(address);
    } catch (err) {
      console.log("Couldn't disconnect:", err.toString());
    }
  };

  const getSelectedMacAddressValue = () => {
    return macAddresses.find(ad => ad.id === selectedMacAddress)?.address;
  };

  const formatMacAddress = value => {
    // Remove everything except hexadecimal characters
    const hex = value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 12);

    // Add ":" every 2 characters
    return hex.match(/.{1,2}/g)?.join(':') ?? '';
  };

  return (
    <MainLayout>
      <CustomLoadingModal
        loading={loading}
        onCancel={() => abortController.current?.abort()}
        status={loadingStatus}
      />
      <View style={styles.container}>
        <View style={styles.connection}>
          <ConnectionIcon />
          <CustomText style={styles.connectionText}>
            {t(`common:${connection}`)}
          </CustomText>
        </View>
        {/* <CustomButton
          text={t('settingsPage:refresh')}
          icon={<RefreshIcon />}
          onPress={refresh}
          style={{
            marginBottom: 16,
            backgroundColor: COLORS.success,
            opacity: sendMethod !== 'bluetooth' ? 0.5 : 1,
          }}
          disabled={sendMethod !== 'bluetooth'}
        /> */}
        <CustomAccordion
          title={t('settingsPage:app_language')}
          Icon={LanguageIcon}
        >
          <View style={[styles.row, { gap: 12 }]}>
            <CustomButton
              text={t('settingsPage:fa')}
              onPress={() => changeLanguage('fa')}
              outline={i18n.resolvedLanguage != 'fa'}
              style={{ flex: 1 }}
            />
            <CustomButton
              text={t('settingsPage:en')}
              onPress={() => changeLanguage('en')}
              outline={i18n.resolvedLanguage != 'en'}
              style={{ flex: 1 }}
            />
          </View>
        </CustomAccordion>
        <CustomAccordion title={t('settingsPage:sms')} Icon={SmsAccordionIcon}>
          <CustomPicker
            selectedValue={selectedAlarmId}
            onValueChange={v => setSelectedAlarmId(v)}
            options={alarms.map(a => ({ label: a.name, value: a.id }))}
            containerStyle={{ marginBottom: 16 }}
          />

          <View style={[styles.row, { marginBottom: 16 }]}>
            <CustomButton
              onPress={addAlarm}
              text={t('settingsPage:add_device')}
              style={{ flex: 1, marginInlineStart: 8, marginInlineEnd: 8 }}
            />
            <CustomButton
              onPress={removeSelectedAlarm}
              text={t('settingsPage:remove_device')}
              style={{ flex: 1, backgroundColor: COLORS.error }}
            />
          </View>

          <CustomInput
            style={styles.input}
            placeholder={t('settingsPage:alarm_name_placeholder')}
            value={selectedAlarm.name}
            onChangeText={name =>
              setAlarms(prev =>
                prev.map(a => (a.id === selectedAlarmId ? { ...a, name } : a)),
              )
            }
          />
          <CustomInput
            style={styles.input}
            placeholder={t('settingsPage:phone_placeholder')}
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
            placeholder={t('settingsPage:password_placeholder')}
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

        <CustomAccordion
          title={t('settingsPage:bluetooth')}
          Icon={BluetoothIcon}
        >
          <CustomPicker
            selectedValue={selectedMacAddress}
            onValueChange={async v => {
              await disconnectCurrentConnection();
              setSelectedMacAddress(v);
            }}
            options={macAddresses.map(a => ({ label: a.name, value: a.id }))}
            containerStyle={{ marginBottom: 16 }}
          />

          <View style={[styles.row, { marginBottom: 16 }]}>
            <CustomButton
              onPress={addMacAddress}
              text={t('settingsPage:add_bluetooth')}
              style={{ flex: 1, marginInlineStart: 8, marginInlineEnd: 8 }}
            />
            <CustomButton
              onPress={removeMacAddress}
              text={t('settingsPage:remove_bluetooth')}
              style={{ flex: 1, backgroundColor: COLORS.error }}
            />
          </View>

          <CustomInput
            style={[styles.input, !selectedMacAddress ? { opacity: 0.5 } : {}]}
            placeholder={t('settingsPage:bluetoothName_placeholder')}
            value={macAddressName}
            editable={selectedMacAddress ? true : false}
            onChangeText={setMacAddressName}
          />
          <CustomInput
            style={[styles.input, !selectedMacAddress ? { opacity: 0.5 } : {}]}
            placeholder={t('settingsPage:bluetoothValue_placeholder')}
            value={macAddressValue}
            editable={selectedMacAddress ? true : false}
            onChangeText={text => {
              setMacAddressValue(formatMacAddress(text))
            }}
            autoCapitalize="characters"
            maxLength={17}
          />
          <CustomInput
            style={[styles.input, !selectedMacAddress ? { opacity: 0.5 } : {}]}
            placeholder={t('settingsPage:password_placeholder')}
            secureTextEntry
            value={macAddressPassword}
            editable={selectedMacAddress ? true : false}
            onChangeText={setMacAddressPassword}
          />

          <CustomSaveButton onPress={saveSelectedMacAddress} />
        </CustomAccordion>
      </View>
    </MainLayout>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 12,
  },
  connection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.tint5,
    padding: 8,
    borderRadius: 8,
  },
  connectionText: {
    marginInlineStart: 16,
  },
});
