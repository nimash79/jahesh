import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
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
import CustomPicker from '../components/shared/CustomPicker';
import CustomSaveButton from '../components/shared/CustomSaveButton';
import CustomText from '../components/shared/CustomText';
import SettingsIcon from './../components/icons/SettingsIcon';
import ZoneIcon from './../components/icons/ZoneIcon';
import CustomButton from './../components/shared/CustomButton';

const ZoneScreen = () => {
  const { t } = useTranslation();
  const [zoneNumber1, setZoneNumber1] = useState(1);
  const [zoneNumber2, setZoneNumber2] = useState(1);
  const [zoneType, setZoneType] = useState('');
  const [operatingStatus, setOperatingStatus] = useState(false);
  const [outputType, setOutputType] = useState(['']);

  const { sendMethod, memory } = useSelector(state => state);
  const dispatch = useDispatch();

  useEffect(() => {
    // zoneNumber1
    if (memory.zones[zoneNumber1 - 1].work_zone.Fire_mode) setZoneType('fire');
    else if (memory.zones[zoneNumber1 - 1].work_zone._24h_mode)
      setZoneType('24h');
    else if (memory.zones[zoneNumber1 - 1].work_zone.Normal_mode)
      setZoneType('ordinary');
    else setZoneType('');
    setOperatingStatus(!memory.zones[zoneNumber1 - 1].work_zone.State_pin_read);
    // zoneNumber2
    const types = [];
    if (memory.zones[zoneNumber2 - 1].outputs_zone.Ding_dong)
      types.push('ding_dong');
    if (memory.zones[zoneNumber2 - 1].outputs_zone.Sms) types.push('sms');
    if (memory.zones[zoneNumber2 - 1].outputs_zone.G_tell) types.push('call');
    if (memory.zones[zoneNumber2 - 1].outputs_zone.Siren) types.push('siren');
    if (memory.zones[zoneNumber2 - 1].outputs_zone.Speaker)
      types.push('speaker');
    setOutputType(types);
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
    if (sendMethod === 'sms') {
      const isOpen = zoneNumber1 > 5 ? '0' : operatingStatus ? '0' : '1';
      const isFire = zoneType === 'fire' ? '1' : '0';
      const is24h = zoneType === '24h' ? '1' : '0';
      const isOrdinary = zoneType === 'ordinary' ? '1' : '0';
      const hex = binToNumber(isOpen + isOrdinary + is24h + isFire);
      const vars = [zoneNumber1 - 1, hex];
      const command = await createCommand(OPCODE.ZONES_SETTINGS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.zones[zoneNumber1 - 1].work_zone.Fire_mode =
        zoneType === 'fire' ? 1 : 0;
      newMemory.zones[zoneNumber1 - 1].work_zone.Normal_mode =
        zoneType === 'ordinary' ? 1 : 0;
      newMemory.zones[zoneNumber1 - 1].work_zone._24h_mode =
        zoneType === '24h' ? 1 : 0;
      newMemory.zones[zoneNumber1 - 1].work_zone.State_pin_read =
        zoneNumber1 > 5 ? 0 : operatingStatus ? 0 : 1;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  const saveOutputSettings = async () => {
    if (sendMethod === 'sms') {
      const isDingDong = outputType.includes('ding_dong') ? '1' : '0';
      const isSpeaker = outputType.includes('speaker') ? '1' : '0';
      const isSiren = outputType.includes('siren') ? '1' : '0';
      const isCall = outputType.includes('call') ? '1' : '0';
      const isSms = outputType.includes('sms') ? '1' : '0';
      const hex = binToNumber(
        isSms + isCall + isSiren + isSpeaker + isDingDong,
      );
      const vars = [zoneNumber2 - 1, hex];
      const command = await createCommand(OPCODE.OUTPUT_SETTINGS, vars);
      const currentAlarmNumber = await getAlarmNumber();
      Linking.openURL(
        `sms:${currentAlarmNumber}?body=${encodeURIComponent(command)}`,
      );
    } else {
      const newMemory = createMem();
      newMemory.bytes.set(memory.bytes);
      newMemory.zones[zoneNumber2 - 1].outputs_zone.Ding_dong =
        outputType.includes('ding_dong') ? 1 : 0;
      newMemory.zones[zoneNumber2 - 1].outputs_zone.Speaker =
        outputType.includes('speaker') ? 1 : 0;
      newMemory.zones[zoneNumber2 - 1].outputs_zone.Siren = outputType.includes(
        'siren',
      )
        ? 1
        : 0;
      newMemory.zones[zoneNumber2 - 1].outputs_zone.G_tell =
        outputType.includes('call') ? 1 : 0;
      newMemory.zones[zoneNumber2 - 1].outputs_zone.Sms = outputType.includes(
        'sms',
      )
        ? 1
        : 0;
      dispatch(updateMemory(newMemory));
      notif_success(t('common:success_save'));
    }
  };

  return (
    <MainLayout>
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
                  'zonePage:wired',
                )})`,
                value: 4,
              },
              {
                label: `${t('zonePage:zone_number', { number: 5 })} (${t(
                  'zonePage:wired',
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
              {
                label: `${t('zonePage:zone_number', { number: 9 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 9,
              },
              {
                label: `${t('zonePage:zone_number', { number: 10 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 10,
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
                  'zonePage:wired',
                )})`,
                value: 4,
              },
              {
                label: `${t('zonePage:zone_number', { number: 5 })} (${t(
                  'zonePage:wired',
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
              {
                label: `${t('zonePage:zone_number', { number: 9 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 9,
              },
              {
                label: `${t('zonePage:zone_number', { number: 10 })} (${t(
                  'zonePage:wireless',
                )})`,
                value: 10,
              },
            ]}
            containerStyle={{ width: '100%', marginBottom: 16 }}
          />
          <CustomText style={styles.sectionTitle}>{t('zonePage:output_type')}</CustomText>
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
    alignSelf: "center",
    marginBottom: 16,
  },
});
