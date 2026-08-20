import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  I18nManager,
  Pressable,
  PermissionsAndroid,
  Platform,
  Text,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import RNRestart from 'react-native-restart';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';

import PowerIcon from './src/components/icons/PowerIcon';
import ZoneIcon from './src/components/icons/ZoneIcon';
import DeviceIcon from './src/components/icons/DeviceIcon';
import PhoneIcon from './src/components/icons/PhoneIcon';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import DeviceScreen from './src/screens/DeviceScreen';
import ZoneScreen from './src/screens/ZoneScreen';
import { useEffect } from 'react';
import { toastConfig } from './src/utils/toast';

import './src/localization/i18n';
import MainLayout from './src/layouts/MainLayout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { loadSendMethod } from './src/reducers/sendMethodReducer';
import { addLanguage, getLanguage } from './src/utils/language_storage';
import {
  cancelConnection,
  connectUntilSuccess,
  getSelectedMacAddress,
  hexToBytes,
  numberToHex,
} from './src/utils/helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './src/utils/constants';
import SettingsScreen from './src/screens/SettingsScreen';
import { changeConnection } from './src/reducers/connectionReducer';
import { loadMemory } from './src/reducers/memoryReducer';
import { store } from './src/store';
import MemoryDesign from './src/memory/MemoryDesign';
import DebugScreen from './src/screens/DebugScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const requestBluetoothPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (
        granted['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('All bluetooth permissions granted');
        return true;
      } else {
        console.warn('Bluetooth permissions denied', granted);
        return false;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }
  return true;
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </Provider>

        <Toast config={toastConfig} />
        <StatusBar barStyle={'dark-content'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const RootNavigator = () => {
  const sendMethod = useSelector(state => state.sendMethod);
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await requestBluetoothPermissions();
      // const hex ="01 01 08 05 04 01 02 00 00 10 00 12 00 1A 00 1E 00 1F 02 01 00 00 00 00 08 02 00 00 00 00 01 03 00 00 00 00 04 22 00 00 00 00 00 00 00 00 00 00 D1 03 D2 04 D2 04 00 EE 5F 0A 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 E1 FE A5 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 01 01 01 01 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 0A 04 05 06 1A 02 03 32"
      // dispatch(loadMemory(hexToBytes(hex)));
    })();
    const sub1 = RNBluetoothClassic.onDeviceConnected(async event => {
      console.log('device connected:', event.device);
      await dispatch(changeConnection('connected'));
    });
    const sub2 = RNBluetoothClassic.onDeviceDisconnected(async event => {
      console.log('device disconnected:', event.device);
      await dispatch(changeConnection('disconnected'));
      if (store.getState().sendMethod === 'bluetooth') {
        await dispatch(changeConnection('connecting'));
        const selectedMacAddressValue = await getSelectedMacAddress();
        connectUntilSuccess(selectedMacAddressValue, dispatch);
      }
    });
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const selectedMacAddressValue = await getSelectedMacAddress();
      if (sendMethod === 'bluetooth') {
        const isEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
        if (isEnabled) {
          await dispatch(changeConnection('connecting'));
          connectUntilSuccess(selectedMacAddressValue, dispatch);
        }
      } else {
        const connected = await RNBluetoothClassic.isDeviceConnected(
          selectedMacAddressValue,
        );
        await dispatch(changeConnection('disconnected'));
        if (connected) {
          await RNBluetoothClassic.disconnectFromDevice(
            selectedMacAddressValue,
          );
        }
        await cancelConnection(dispatch);
      }
    })();
  }, [sendMethod]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Debug"
        component={DebugScreen}
        options={{
          presentation: 'modal',
          // animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

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
