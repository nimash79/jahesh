import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

import {
  binToNumber,
  bluetoothResponseValidation,
  bytesToHex,
  createBluetoothCommand,
  createCommand,
  getAlarmNumber,
  getSelectedMacAddress,
  sendAndWaitForBluetoothResponse,
} from '../utils/helper';
import { COLORS, OPCODE } from '../utils/constants';
import { createMem } from '../memory';
import { notif_error, notif_success } from '../utils/toast';
import CustomAccordion from '../components/shared/CustomAccordion';
import MainLayout from '../layouts/MainLayout';
import CustomButton from '../components/shared/CustomButton';
import CustomSaveButton from './../components/shared/CustomSaveButton';
import CustomInput from './../components/shared/CustomInput';
import LanguageIcon from './../components/icons/LanguageIcon';
import PhoneIcon from './../components/icons/PhoneIcon';
import SettingsIcon from './../components/icons/SettingsIcon';
import CustomPicker from './../components/shared/CustomPicker';
import ListIcon from './../components/icons/ListIcon';
import CustomText from '../components/shared/CustomText';
import CustomLoadingModal from './../components/modals/CustomLoadingModal';
import MemoryDesign from './../memory/MemoryDesign';
import { MemDesign } from '../memory/MemDesign';

const ContactsScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const memory = useSelector(state => state.memory);
  const sendMethod = useSelector(state => state.sendMethod);

  const [smsLanguage, setSmsLanguage] = useState('fa');
  const [phoneNumber1, setPhoneNumber1] = useState(0);
  const [phoneNumber2, setPhoneNumber2] = useState(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [phoneTypes, setPhoneTypes] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('loading');

  const abortController = useRef(null);

  useEffect(() => {
    if (memory.bytes.length == 168) {
      const mem = new MemDesign(memory.bytes);
      setSmsLanguage(mem.System_settings.S_Settings.sms_lang ? 'en' : 'fa');
      setPhoneNumbers(
        mem.Phone_numbers.map(phone => mem.getPhoneNumberAsNumber(phone.data)),
      );
      setMobileNumber(
        mem.getPhoneNumberAsNumber(mem.Phone_numbers[phoneNumber1].data),
      );
      const types = [];
      if (mem.Phone_numbers[phoneNumber2].Number_settings.ambient_listening)
        types.push('ambient_listening');
      if (mem.Phone_numbers[phoneNumber2].Number_settings.admin) types.push('admin');
      if (mem.Phone_numbers[phoneNumber2].Number_settings.report) types.push('report');
      if (mem.Phone_numbers[phoneNumber2].Number_settings.guard) types.push('guard');
      if (mem.Phone_numbers[phoneNumber2].Number_settings.reserved) types.push('reserved');
      setPhoneTypes(types);
    }
  }, [memory, phoneNumber1, phoneNumber2]);
  const toggleType = type => {
    setPhoneTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  const saveSmsLanguage = async () => {
    const vars = [smsLanguage == 'en' ? 1 : 0];
    if (sendMethod === 'sms') {
      const currentAlarmNumber = await getAlarmNumber();
      const command = await createCommand(OPCODE.SMS_LANGUAGE, vars);
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
        OPCODE.SMS_LANGUAGE,
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
          OPCODE.SMS_LANGUAGE,
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
      newMemory.system_settings.S_Settings.sms_lang =
        smsLanguage == 'fa' ? 0 : 1;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const savePhones = async () => {
    const vars = [phoneNumber1, mobileNumber];
    if (sendMethod === 'sms') {
      const currentAlarmNumber = await getAlarmNumber();
      const command = await createCommand(OPCODE.PHONES, vars);
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
      const dataToSend = await createBluetoothCommand(OPCODE.PHONES, vars);
      abortController.current = new AbortController();
      setLoadingStatus('loading');
      setLoading(true);
      try {
        const response = await sendAndWaitForBluetoothResponse(
          selectedMacAddressValue,
          dataToSend,
          abortController.current.signal,
        );
        const validation = bluetoothResponseValidation(response, OPCODE.PHONES);

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
      newMemory.phone_numbers[phoneNumber1 - 1].data = mobileNumber;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const addOrRemovePhoneTypes = value => {
    setPhoneTypes(types => {
      if (types.includes(value)) return types.filter(t => t !== value);
      else {
        const list = [...types];
        list.push(value);
        return list;
      }
    });
  };

  const savePhoneNumberSettings = async () => {
    const isManager = phoneTypes.includes('admin') ? '1' : '0';
    const isReport = phoneTypes.includes('report') ? '1' : '0';
    const isGuard = phoneTypes.includes('guard') ? '1' : '0';
    const isAmbientListening = phoneTypes.includes('ambient_listening')
      ? '1'
      : '0';
    const hex = binToNumber(
      isGuard + isManager + isReport + isAmbientListening,
    );
    const vars = [phoneNumber2, hex];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.PHONES_SETTINGS, vars);
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
        OPCODE.PHONES_SETTINGS,
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
          OPCODE.PHONES_SETTINGS,
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
      newMemory.phone_numbers[phoneNumber2].number_settings.admin =
        phoneTypes.includes('admin');
      newMemory.phone_numbers[phoneNumber2].number_settings.report =
        phoneTypes.includes('report');
      newMemory.phone_numbers[phoneNumber2].number_settings.guard =
        phoneTypes.includes('guard');
      newMemory.phone_numbers[phoneNumber2].number_settings.ambient_listening =
        phoneTypes.includes('ambient_listening');
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
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
        <CustomAccordion
          title={t('contactsPage:sms_language')}
          Icon={LanguageIcon}
        >
          <View style={styles.row}>
            <CustomButton
              text={t('contactsPage:fa')}
              onPress={() => setSmsLanguage('fa')}
              outline={smsLanguage !== 'fa'}
              style={{ flex: 1 }}
            />
            <CustomButton
              text={t('contactsPage:en')}
              onPress={() => setSmsLanguage('en')}
              outline={smsLanguage !== 'en'}
              style={{ flex: 1 }}
            />
          </View>

          <CustomSaveButton onPress={saveSmsLanguage} />
        </CustomAccordion>

        <CustomAccordion title={t('contactsPage:phones')} Icon={PhoneIcon}>
          <CustomPicker
            selectedValue={phoneNumber1}
            onValueChange={setPhoneNumber1}
            options={[
              {
                label: t('contactsPage:phone_number', { number: 0 }),
                value: 0,
              },
              {
                label: t('contactsPage:phone_number', { number: 1 }),
                value: 1,
              },
              {
                label: t('contactsPage:phone_number', { number: 2 }),
                value: 2,
              },
              {
                label: t('contactsPage:phone_number', { number: 3 }),
                value: 3,
              },
              {
                label: t('contactsPage:phone_number', { number: 4 }),
                value: 4,
              },
            ]}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomInput
            keyboardType="numeric"
            value={mobileNumber?.toString()}
            onChangeText={setMobileNumber}
            style={styles.input}
            placeholder={t('contactsPage:phone_placeholder')}
          />
          <CustomSaveButton onPress={savePhones} />
        </CustomAccordion>

        <CustomAccordion
          title={t('contactsPage:phones_settings')}
          Icon={SettingsIcon}
        >
          <CustomPicker
            options={[
              {
                label: t('contactsPage:phone_number', { number: 0 }),
                value: 0,
              },
              {
                label: t('contactsPage:phone_number', { number: 1 }),
                value: 1,
              },
              {
                label: t('contactsPage:phone_number', { number: 2 }),
                value: 2,
              },
              {
                label: t('contactsPage:phone_number', { number: 3 }),
                value: 3,
              },
              {
                label: t('contactsPage:phone_number', { number: 4 }),
                value: 4,
              },
            ]}
            containerStyle={{ marginBottom: 16 }}
            selectedValue={phoneNumber2}
            onValueChange={setPhoneNumber2}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: 16,
              justifyContent: 'space-between',
              marginVertical: 16,
            }}
          >
            <CustomButton
              text={t('contactsPage:manager')}
              style={{ flexBasis: '45%' }}
              outline={!phoneTypes.includes('admin')}
              onPress={() => addOrRemovePhoneTypes('admin')}
            />
            <CustomButton
              text={t('contactsPage:report')}
              style={{ flexBasis: '45%' }}
              outline={!phoneTypes.includes('report')}
              onPress={() => addOrRemovePhoneTypes('report')}
            />
            <CustomButton
              text={t('contactsPage:guard')}
              style={{ flexBasis: '45%' }}
              outline={!phoneTypes.includes('guard')}
              onPress={() => addOrRemovePhoneTypes('guard')}
            />
            <CustomButton
              text={t('contactsPage:ambient_listening')}
              style={{ flexBasis: '45%' }}
              outline={!phoneTypes.includes('ambient_listening')}
              onPress={() => addOrRemovePhoneTypes('ambient_listening')}
            />
          </View>
          <CustomSaveButton onPress={savePhoneNumberSettings} />
        </CustomAccordion>
        <CustomAccordion
          title={t('contactsPage:phones_list')}
          Icon={ListIcon}
          disabled={sendMethod === 'sms'}
        >
          {phoneNumbers.map((item, index) => (
            <View
              key={index}
              style={[
                styles.listItem,
                { backgroundColor: index % 2 ? COLORS.tint1 : COLORS.tint0 },
              ]}
            >
              <CustomText>{index}.</CustomText>
              <CustomText>{item}</CustomText>
            </View>
          ))}
        </CustomAccordion>
      </View>
    </MainLayout>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  input: { marginBottom: 16 },
  picker: {
    color: COLORS.neutral40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral40,
  },
  listItem: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    direction: 'ltr',
    gap: 16,
  },
});
