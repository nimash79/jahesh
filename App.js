import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  I18nManager,
  Pressable,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import RNRestart from 'react-native-restart';

import PowerIcon from './src/components/icons/PowerIcon';
import ZoneIcon from './src/components/icons/ZoneIcon';
import DeviceIcon from './src/components/icons/DeviceIcon';
import PhoneIcon from './src/components/icons/PhoneIcon';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import DeviceScreen from './src/screens/DeviceScreen';
import ZoneScreen from './src/screens/ZoneScreen';
import { store } from './src/store/index';
import { useEffect } from 'react';
import { toastConfig } from './src/utils/toast';

import './src/localization/i18n';
import MainLayout from './src/layouts/MainLayout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { loadSendMethod } from './src/reducers/sendMethodReducer';
import { addLanguage, getLanguage } from './src/utils/language_storage';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </Provider>

        <Toast config={toastConfig} />
        <StatusBar barStyle={'dark-content'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();

  const { i18n } = useTranslation();

  useEffect(() => {
    // language
    (async () => {
      const lang = await getLanguage();
      if (!lang) return;
      await i18n.changeLanguage(lang);

      const shouldRTL = lang !== 'en';

      if (I18nManager.isRTL !== shouldRTL) {
        I18nManager.allowRTL(shouldRTL);
        I18nManager.forceRTL(shouldRTL);
        RNRestart.restart();
      }
    })();

    dispatch(loadSendMethod());
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'Shabnam-Bold',
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#F3F6FB',
          height: 73 + insets.bottom,
          paddingTop: 12,
          paddingBottom: 16 + insets.bottom,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#7B61FF',
        tabBarInactiveTintColor: '#868686',
        tabBarButton: props => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={props.style}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PowerIcon
              width={24}
              height={24}
              color={focused ? '#7b61ff' : '#868686'}
            />
          ),
          tabBarLabel: t('common:control'),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PhoneIcon
              width={24}
              height={24}
              color={focused ? '#7b61ff' : '#868686'}
            />
          ),
          tabBarLabel: t('common:phone_settings'),
        }}
      />
      <Tab.Screen
        name="Device"
        component={DeviceScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <DeviceIcon
              width={24}
              height={24}
              color={focused ? '#7b61ff' : '#868686'}
            />
          ),
          tabBarLabel: t('common:device_settings'),
        }}
      />
      <Tab.Screen
        name="Zone"
        component={ZoneScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <ZoneIcon
              width={24}
              height={24}
              color={focused ? '#7b61ff' : '#868686'}
            />
          ),
          tabBarLabel: t('common:zone_settings'),
        }}
      />
    </Tab.Navigator>
  );
}

export default App;
