import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

import {
  bluetoothCommandValidation,
  bluetoothResponseValidation,
  bytesToHex,
  createBluetoothCommand,
  createCommand,
  getAlarmNumber,
  getSelectedMacAddress,
  hexToBytes,
  sendAndWaitForBluetoothResponse,
} from '../utils/helper';
import { COLORS, OPCODE, STORAGE_KEYS } from '../utils/constants';
import { notif_error, notif_success } from '../utils/toast';
import { createMem } from '../memory';
import CustomAccordion from '../components/shared/CustomAccordion';
import PowerIcon from './../components/icons/PowerIcon';
import RelayIcon from './../components/icons/RelayIcon';
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
import AmbientListenIcon from '../components/icons/AmbientListenIcon';
import SilentIcon from '../components/icons/SilentIcon';
import BluetoothIcon from '../components/icons/BluetoothIcon';
import MemoryDesign from '../memory/MemoryDesign';
import CustomLoadingModal from '../components/modals/CustomLoadingModal';
import RefreshIcon from '../components/icons/RefreshIcon';
import RefreshButton from '../components/RefreshButton';
import { loadMemory } from '../reducers/memoryReducer';
import { useNavigation } from '@react-navigation/native';
import { MemDesign } from './../memory/MemDesign';

const HomeScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const memory = useSelector(state => state.memory);
  const sendMethod = useSelector(state => state.sendMethod);

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('loading');
  const [deviceStatus, setDeviceStatus] = useState(false);
  const [relayStatus, setRelayStatus] = useState(false);
  const [relayNumber, setRelayNumber] = useState(0);
  
  const abortController = useRef(null);

  const navigation = useNavigation();

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

  // --- Memory update from redux ---
  useEffect(() => {
    if (memory.bytes.length == 168) {
      const mem = new MemDesign(memory.bytes);
      setDeviceStatus(mem.device_state > 0);
      setRelayNumber(0);
      setRelayStatus(mem.System_settings.S_Settings.relay_state > 0);
    }
  }, [memory]);

  // ---------- REFRESH ----------
  const refresh = async () => {
    const vars = [];
    if (sendMethod === 'bluetooth') {
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
        OPCODE.SYSTEM_UPDATE,
        vars,
      );
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          let response = await sendAndWaitForBluetoothResponse(
            selectedMacAddressValue,
            dataToSend,
            abortController.current.signal,
          );
          if (bluetoothCommandValidation(response)) {
            await dispatch(loadMemory(response));
            setLoadingStatus('success');
            return;
            // notif_success(t('common:success'), t('common:success_send'));
          } else {
            notif_error(t('common:error'), t('common:bluetooth_invalidData'));
          }
        } catch (err) {
          console.log('err:', err);
          // if (err == 'Error: Response timeout')
          //   notif_error(t('common:error'), t('common:bluetooth_responseError'));
          if (err == 'Error: Operation cancelled')
            break;
        }
      }
      setLoadingStatus('error');
    }
  };

  // ---------- SAVE DEVICE STATUS ----------
  const saveDeviceStatus = async () => {
    const vars = [!deviceStatus ? 0 : 1];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.DEVICE_STATUS, vars);
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
        OPCODE.DEVICE_STATUS,
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
          OPCODE.DEVICE_STATUS,
        );

        if (!validation.valid) {
          console.log('Invalid response:', validation);

          setLoadingStatus('error');

          notif_error(t('common:error'), t('common:bluetooth_invalidData'));

          return;
        }
        setLoadingStatus('success');
        setDeviceStatus(d => !d);
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
      newMemory.device_state.locked = deviceStatus;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  // ---------- SAVE RELAY ----------
  const saveRelayStatus = async () => {
    // validation
    if (relayNumber == null || relayNumber < 0 || relayNumber > 99) {
      notif_error(t('common:error'), t('homePage:relay_validation'));
      return;
    }
    const vars = [relayNumber, relayStatus ? 1 : 0];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.RELAY_STATUS, vars);
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
        OPCODE.RELAY_STATUS,
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
          OPCODE.RELAY_STATUS,
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
      newMemory.device_state[`relay${relayNumber}`] = relayStatus;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveAmbientListening = async () => {
    const vars = [];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.AMBIENT_LISTENING, vars);
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
        OPCODE.AMBIENT_LISTENING,
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
        await Alert.alert('Received data:', bytesToHex(response));
        const validation = bluetoothResponseValidation(
          response,
          OPCODE.AMBIENT_LISTENING,
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
        status={loadingStatus}
        onCancel={() => abortController.current?.abort()}
        close={() => setLoading(false)}
      />
      <View style={styles.container}>
        {/* <CustomButton text={"Debug"} onPress={() => navigation.navigate("Debug")} style={{marginBottom: 16}} /> */}
        {sendMethod === 'bluetooth' ? (
          <CustomAccordion title={t('homePage:refresh')} Icon={RefreshIcon}>
            <RefreshButton onPress={refresh} />
          </CustomAccordion>
        ) : null}

        <CustomAccordion title={t('homePage:device_status')} Icon={PowerIcon}>
          <LockToggle locked={!deviceStatus} onToggle={saveDeviceStatus} />
        </CustomAccordion>

        <CustomAccordion title={t('homePage:relays_status')} Icon={RelayIcon}>
          {/* <CustomPicker
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
          /> */}

          <CustomInput
            keyboardType="numeric"
            value={relayNumber?.toString()}
            onChangeText={setRelayNumber}
            style={{ marginBottom: 16 }}
            placeholder={t('homePage:relay_placeholder')}
          />

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

        <CustomAccordion
          title={t('homePage:ambient_listening')}
          Icon={AmbientListenIcon}
        >
          <CustomButton
            onPress={saveAmbientListening}
            text={t('homePage:ambient_listening')}
            style={{ marginBottom: 16 }}
          />
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999, // Android
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
