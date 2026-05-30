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

import { binToNumber, createCommand, getAlarmNumber } from '../utils/helper';
import { COLORS, OPCODE } from '../utils/constants';
import { createMem } from '../memory';
import { updateMemory } from '../reducers/memoryReducer';
import { notif_success } from '../utils/toast';
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

const ContactsScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { memory, sendMethod } = useSelector(state => state);

  const [smsLanguage, setSmsLanguage] = useState('fa');
  const [phoneNumber1, setPhoneNumber1] = useState(1);
  const [phoneNumber2, setPhoneNumber2] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [phoneTypes, setPhoneTypes] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  useEffect(() => {
    setSmsLanguage(
      memory.system_settings.S_Settings.sms_lang == 0 ? 'fa' : 'en',
    );
    // phoneNumbers
    setPhoneNumbers(memory.phone_numbers.map(x => x.data));
    // phoneNumber1
    setMobileNumber(memory.phone_numbers[phoneNumber1 - 1].data);
    // phoneNumber2
    const types = [];
    if (memory.phone_numbers[phoneNumber2 - 1].number_settings.lobbyman)
      types.push('lobbyman');
    if (memory.phone_numbers[phoneNumber2 - 1].number_settings.admin)
      types.push('admin');
    if (memory.phone_numbers[phoneNumber2 - 1].number_settings.report)
      types.push('report');
    if (memory.phone_numbers[phoneNumber2 - 1].number_settings.guard)
      types.push('guard');
    if (memory.phone_numbers[phoneNumber2 - 1].number_settings.reserved)
      types.push('reserved');
    setPhoneTypes(types);
  }, [memory, phoneNumber1, phoneNumber2]);

  const toggleType = type => {
    setPhoneTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  const saveSmsLanguage = async () => {
    if (sendMethod === 'sms') {
      const vars = [smsLanguage == 'en' ? 1 : 0];
      const currentAlarmNumber = await getAlarmNumber();
      const command = await createCommand(OPCODE.SMS_LANGUAGE, vars);
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
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
    if (sendMethod === 'sms') {
      const vars = [phoneNumber1 - 1, mobileNumber];
      const currentAlarmNumber = await getAlarmNumber();
      const command = await createCommand(OPCODE.PHONES, vars);
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
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
    if (sendMethod === 'sms') {
      const isManager = phoneTypes.includes('admin') ? '1' : '0';
      const isReport = phoneTypes.includes('report') ? '1' : '0';
      const isGuard = phoneTypes.includes('guard') ? '1' : '0';
      const isLobyman = phoneTypes.includes('lobbyman') ? '1' : '0';
      const hex = binToNumber(isGuard + isManager + isReport + isLobyman);
      const vars = [phoneNumber2 - 1, hex];
      const command = await createCommand(OPCODE.PHONES_SETTINGS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.phone_numbers[phoneNumber2 - 1].number_settings.admin =
        phoneTypes.includes('admin');
      newMemory.phone_numbers[phoneNumber2 - 1].number_settings.report =
        phoneTypes.includes('report');
      newMemory.phone_numbers[phoneNumber2 - 1].number_settings.guard =
        phoneTypes.includes('guard');
      newMemory.phone_numbers[phoneNumber2 - 1].number_settings.lobbyman =
        phoneTypes.includes('lobbyman');
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  return (
    <MainLayout>
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
              {
                label: t('contactsPage:phone_number', { number: 5 }),
                value: 5,
              },
            ]}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomInput
            keyboardType="numeric"
            value={mobileNumber}
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
              {
                label: t('contactsPage:phone_number', { number: 5 }),
                value: 5,
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
              text={t('contactsPage:lobyman')}
              style={{ flexBasis: '45%' }}
              outline={!phoneTypes.includes('lobbyman')}
              onPress={() => addOrRemovePhoneTypes('lobbyman')}
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
              <CustomText>{index + 1}.</CustomText>
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
