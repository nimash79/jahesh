import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
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
import { updateMemory } from '../reducers/memoryReducer';
import { notif_error, notif_success } from '../utils/toast';
import CustomAccordion from '../components/shared/CustomAccordion';
import MainLayout from '../layouts/MainLayout';
import CustomPicker from '../components/shared/CustomPicker';
import CustomSaveButton from '../components/shared/CustomSaveButton';
import CustomText from '../components/shared/CustomText';
import SettingsIcon from './../components/icons/SettingsIcon';
import ZoneIcon from './../components/icons/ZoneIcon';
import CustomButton from './../components/shared/CustomButton';
import CustomLoadingModal from '../components/modals/CustomLoadingModal';
import MemoryDesign from './../memory/MemoryDesign';

const ZoneScreen = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('loading');
  const [zoneNumber1, setZoneNumber1] = useState(0);
  const [zoneNumber2, setZoneNumber2] = useState(0);
  const [zoneType, setZoneType] = useState('');
  const [operatingStatus, setOperatingStatus] = useState(false);
  const [outputType, setOutputType] = useState(['']);

  const abortController = useRef(null);

  const memory = useSelector(state => state.memory);
  const sendMethod = useSelector(state => state.sendMethod);
  const dispatch = useDispatch();

  useEffect(() => {
    if (memory.bytes.length == 168) {
      const mem = new MemoryDesign(memory.bytes);
      // zoneNumber1
      if (mem.zones[zoneNumber1].fireMode) setZoneType('fire');
      else if (mem.zones[zoneNumber1].h24Mode) setZoneType('24h');
      else if (mem.zones[zoneNumber1].normalMode) setZoneType('ordinary');
      else setZoneType('');
      setOperatingStatus(!mem.zones[zoneNumber1].statePinRead);
      // zoneNumber2
      const types = [];
      if (mem.zones[zoneNumber2].dingDong) types.push('ding_dong');
      if (mem.zones[zoneNumber2].sms) types.push('sms');
      if (mem.zones[zoneNumber2].gTell) types.push('call');
      if (mem.zones[zoneNumber2].siren) types.push('siren');
      if (mem.zones[zoneNumber2].speaker) types.push('speaker');
      setOutputType(types);
    }
  }, [memory, zoneNumber1, zoneNumber2]);

  const addOrRemoveOutputType = value => {
    setOutputType(types => {
      if (types.includes(value)) return types.filter(t => t !== value);
      else {
        const list = [...types];
        list.push(value);
        return list;
      }
    });
  };

  const saveZoneSettings = async () => {
    const isOpen = zoneNumber1 > 4 ? '0' : operatingStatus ? '0' : '1';
    const isFire = zoneType === 'fire' ? '1' : '0';
    const is24h = zoneType === '24h' ? '1' : '0';
    const isOrdinary = zoneType === 'ordinary' ? '1' : '0';
    const hex = binToNumber(isOpen + isOrdinary + is24h + isFire);
    const vars = [zoneNumber1, hex];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.ZONES_SETTINGS, vars);
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
        OPCODE.ZONES_SETTINGS,
        vars,
      );
      setLoading(true);
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
          OPCODE.ZONES_SETTINGS,
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
      newMemory.zones[zoneNumber1].work_zone.Fire_mode =
        zoneType === 'fire' ? 1 : 0;
      newMemory.zones[zoneNumber1].work_zone.Normal_mode =
        zoneType === 'ordinary' ? 1 : 0;
      newMemory.zones[zoneNumber1].work_zone._24h_mode =
        zoneType === '24h' ? 1 : 0;
      newMemory.zones[zoneNumber1].work_zone.State_pin_read =
        zoneNumber1 > 4 ? 0 : operatingStatus ? 0 : 1;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveOutputSettings = async () => {
    const isDingDong = outputType.includes('ding_dong') ? '1' : '0';
    const isSpeaker = outputType.includes('speaker') ? '1' : '0';
    const isSiren = outputType.includes('siren') ? '1' : '0';
    const isCall = outputType.includes('call') ? '1' : '0';
    const isSms = outputType.includes('sms') ? '1' : '0';
    const hex = binToNumber(isSms + isCall + isSiren + isSpeaker + isDingDong);
    const vars = [zoneNumber2, hex];
    if (sendMethod === 'sms') {
      const command = await createCommand(OPCODE.OUTPUT_SETTINGS, vars);
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
        OPCODE.OUTPUT_SETTINGS,
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
          OPCODE.OUTPUT_SETTINGS,
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
      newMemory.zones[zoneNumber2].outputs_zone.Ding_dong = outputType.includes(
        'ding_dong',
      )
        ? 1
        : 0;
      newMemory.zones[zoneNumber2].outputs_zone.Speaker = outputType.includes(
        'speaker',
      )
        ? 1
        : 0;
      newMemory.zones[zoneNumber2].outputs_zone.Siren = outputType.includes(
        'siren',
      )
        ? 1
        : 0;
      newMemory.zones[zoneNumber2].outputs_zone.G_tell = outputType.includes(
        'call',
      )
        ? 1
        : 0;
      newMemory.zones[zoneNumber2].outputs_zone.Sms = outputType.includes('sms')
        ? 1
        : 0;
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
          title={t('zonePage:zones_settings')}
          Icon={SettingsIcon}
        >
          <CustomPicker
            selectedValue={zoneNumber1}
            onValueChange={setZoneNumber1}
            options={[
              {
                label: `${t('zonePage:zone_number', { number: 0 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 0,
              },
              {
                label: `${t('zonePage:zone_number', { number: 1 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 1,
              },
              {
                label: `${t('zonePage:zone_number', { number: 2 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 2,
              },
              {
                label: `${t('zonePage:zone_number', { number: 3 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 3,
              },
              {
                label: `${t('zonePage:zone_number', { number: 4 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 4,
              },
              {
                label: `${t('zonePage:zone_number', { number: 5 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 5,
              },
              {
                label: `${t('zonePage:zone_number', { number: 6 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 6,
              },
              {
                label: `${t('zonePage:zone_number', { number: 7 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 7,
              },
              {
                label: `${t('zonePage:zone_number', { number: 8 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 8,
              },
            ]}
            containerStyle={{ marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>
            {t('zonePage:zone_type')}
          </CustomText>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <CustomButton
              text={t('zonePage:fire')}
              style={{ flexBasis: '32%' }}
              outline={zoneType != 'fire'}
              onPress={() => setZoneType('fire')}
            />
            <CustomButton
              text={t('zonePage:h24')}
              style={{ flexBasis: '32%' }}
              outline={zoneType != '24h'}
              onPress={() => setZoneType('24h')}
            />
            <CustomButton
              text={t('zonePage:ordinary')}
              style={{ flexBasis: '32%' }}
              outline={zoneType != 'ordinary'}
              onPress={() => setZoneType('ordinary')}
            />
          </View>
          {zoneNumber1 <= 5 && (
            <>
              <CustomText style={styles.sectionTitle}>
                {t('zonePage:operating_status')}
              </CustomText>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <CustomButton
                  text={t('zonePage:close')}
                  style={{ flexBasis: '45%' }}
                  outline={operatingStatus}
                  onPress={() => setOperatingStatus(false)}
                />
                <CustomButton
                  text={t('zonePage:open')}
                  style={{ flexBasis: '45%' }}
                  outline={!operatingStatus}
                  onPress={() => setOperatingStatus(true)}
                />
              </View>
            </>
          )}
          <CustomSaveButton onPress={saveZoneSettings} />
        </CustomAccordion>

        <CustomAccordion title={t('zonePage:zones_status')} Icon={ZoneIcon}>
          <CustomPicker
            selectedValue={zoneNumber2}
            onValueChange={setZoneNumber2}
            options={[
              {
                label: `${t('zonePage:zone_number', { number: 0 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 0,
              },
              {
                label: `${t('zonePage:zone_number', { number: 1 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 1,
              },
              {
                label: `${t('zonePage:zone_number', { number: 2 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 2,
              },
              {
                label: `${t('zonePage:zone_number', { number: 3 })} (${t(
                  'zonePage:wired',
                )})`,
                value: 3,
              },
              {
                label: `${t('zonePage:zone_number', { number: 4 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 4,
              },
              {
                label: `${t('zonePage:zone_number', { number: 5 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 5,
              },
              {
                label: `${t('zonePage:zone_number', { number: 6 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 6,
              },
              {
                label: `${t('zonePage:zone_number', { number: 7 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 7,
              },
              {
                label: `${t('zonePage:zone_number', { number: 8 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 8,
              },
            ]}
            containerStyle={{ width: '100%', marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>
            {t('zonePage:output_type')}
          </CustomText>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: 16,
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <CustomButton
              text={t('zonePage:ding_dong')}
              style={{ flexBasis: '32%' }}
              outline={!outputType.includes('ding_dong')}
              onPress={() => addOrRemoveOutputType('ding_dong')}
            />
            <CustomButton
              text={t('zonePage:speaker')}
              style={{ flexBasis: '32%' }}
              outline={!outputType.includes('speaker')}
              onPress={() => addOrRemoveOutputType('speaker')}
            />
            <CustomButton
              text={t('zonePage:siren')}
              style={{ flexBasis: '32%' }}
              outline={!outputType.includes('siren')}
              onPress={() => addOrRemoveOutputType('siren')}
            />
            <CustomButton
              text={t('zonePage:call')}
              style={{ flexBasis: '32%' }}
              outline={!outputType.includes('call')}
              onPress={() => addOrRemoveOutputType('call')}
            />
            <CustomButton
              text={t('zonePage:sms')}
              style={{ flexBasis: '32%' }}
              outline={!outputType.includes('sms')}
              onPress={() => addOrRemoveOutputType('sms')}
            />
          </View>
          <CustomSaveButton onPress={saveOutputSettings} />
        </CustomAccordion>
      </View>
    </MainLayout>
  );
};

export default ZoneScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  input: {
    marginBottom: 16,
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
});
