import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import RNRestart from 'react-native-restart';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { changeSendMethod, setSendMethod } from '../reducers/sendMethodReducer';

import SwipeNavigator from './SwipeNavigator';
import AnimatedOutlet from './AnimatedOutlet';
import { COLORS } from '../utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WifiIcon from './../components/icons/WifiIcon';
import SmsIcon from './../components/icons/SmsIcon';
import CustomText from '../components/shared/CustomText';
import { ScrollView } from 'react-native-gesture-handler';
import { addLanguage } from '../utils/language_storage';

const MainLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const sendMethod = useSelector(state => state.sendMethod);
  const insets = useSafeAreaInsets();

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
    await addLanguage(lang);
    RNRestart.restart(); 
  }

  return (
    <SwipeNavigator>
      {direction => (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={10}
        >
          <ScrollView
            style={[styles.container, { marginTop: 4 }]}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <CustomText style={styles.title}>
                {t('common:app_name')}
              </CustomText>
            </View>

            <View
              style={[
                styles.header,
                { justifyContent: 'space-between', marginVertical: 16 },
              ]}
            >
              {/* Language Switch */}
              <View style={styles.dual_buttons}>
                <TouchableOpacity onPress={() => changeLanguage("en")}>
                  <CustomText
                    style={[
                      styles.dual_button,
                      {paddingHorizontal: 12},
                      { marginInlineEnd: 10 },
                      i18n.resolvedLanguage == 'en'
                        ? styles.dual_button_active
                        : {},
                    ]}
                  >
                    EN
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage('fa')}>
                  <CustomText
                    style={[
                      styles.dual_button,
                      {paddingHorizontal: 12},
                      i18n.resolvedLanguage == 'fa'
                        ? styles.dual_button_active
                        : {},
                    ]}
                  >
                    FA
                  </CustomText>
                </TouchableOpacity>
              </View>
              {/* Send Method Switch */}
              <View style={styles.dual_buttons}>
                <TouchableOpacity
                  style={[
                    styles.dual_button,
                    sendMethod === 'wifi' ? styles.dual_button_active : {},
                  ]}
                  onPress={() => dispatch(setSendMethod('wifi'))}
                >
                  <WifiIcon active={sendMethod === 'wifi'} />
                  <CustomText
                    style={[
                      styles.dual_button,
                      { marginInlineEnd: 10 },
                      sendMethod === 'wifi' ? styles.dual_button_active : {},
                    ]}
                  >
                    {t('common:wifi')}
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dual_button,
                    sendMethod === 'sms' ? styles.dual_button_active : {},
                  ]}
                  onPress={() => dispatch(setSendMethod('sms'))}
                >
                  <SmsIcon active={sendMethod === 'sms'} />
                  <CustomText
                    style={[
                      styles.dual_button,
                      sendMethod === 'sms' ? styles.dual_button_active : {},
                    ]}
                  >
                    {t('common:sms')}
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <AnimatedOutlet direction={direction}>{children}</AnimatedOutlet>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SwipeNavigator>
  );
};

export default MainLayout;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0, padding: 25 },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Shabnam-Bold',
    color: COLORS.neutral40,
    paddingBottom: 8,
    borderBottomColor: COLORS.neutral40,
    borderBottomWidth: 2,
  },
  subheader: {},
  dual_buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.tint2,
    borderRadius: 8,
    padding: 4,
  },
  dual_button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 8,
    color: COLORS.tint5,
    fontSize: 12,
  },
  dual_button_active: {
    backgroundColor: COLORS.shade1,
    color: COLORS.neutral_ed,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});
