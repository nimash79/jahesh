import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import LockIcon from './icons/LockIcon'
import UnlockIcon from './icons/UnlockIcon';
import CustomText from './shared/CustomText';

const LockToggle = ({
  locked,
  onToggle,
  lockText = 'قفل',
  unlockText = 'باز',
}) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.92)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;

  const unlockScale = useRef(new Animated.Value(1)).current;
  const unlockRotate = useRef(new Animated.Value(0)).current;

  // pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.65,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.2,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  // locked breathing
  useEffect(() => {
    if (locked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.06,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [locked]);

  // unlock spark
  useEffect(() => {
    if (!locked) {
      unlockScale.setValue(0.86);
      unlockRotate.setValue(-8);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(unlockScale, {
            toValue: 1.12,
            duration: 350,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(unlockScale, {
            toValue: 1,
            duration: 250,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(unlockRotate, {
            toValue: 8,
            duration: 350,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(unlockRotate, {
            toValue: 0,
            duration: 250,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [locked]);

  const rotate = unlockRotate.interpolate({
    inputRange: [-8, 8],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={onToggle} android_ripple={{ color: 'transparent' }}>
        <LinearGradient
          colors={['#ffffff', '#f4f0ff', '#ece6ff']}
          style={styles.button}
        >
          {/* pulse */}
          <Animated.View
            style={[
              styles.pulse,
              {
                backgroundColor: locked
                  ? 'rgba(215,68,68,0.22)'
                  : 'rgba(31,122,72,0.25)',
                transform: [{ scale: pulseAnim }],
                opacity: pulseOpacity,
              },
            ]}
          />

          {/* core */}
          <Animated.View
            style={[
              styles.core,
              locked
                ? {
                    transform: [{ scale: breatheAnim }],
                  }
                : {
                    transform: [
                      { scale: unlockScale },
                      { rotate: rotate },
                    ],
                    shadowColor: '#1f7a48',
                  },
            ]}
          >
            {locked ? (
              <LockIcon color="#a72a2a" width={34} height={34} />
            ) : (
              <UnlockIcon color="#1f7a48" width={34} height={34} />
            )}
          </Animated.View>

          <Animated.Text
            style={[
              styles.text,
              {
                color: locked ? '#a72a2a' : '#1f7a48',
                transform: [{ scale: locked ? 1 : 1.04 }],
              },
            ]}
          >
            {locked ? lockText : unlockText}
          </Animated.Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

export default LockToggle;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },

  button: {
    minHeight: 132,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 20,
  },

  pulse: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
  },

  core: {
    width: 78,
    height: 78,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,

    shadowColor: '#7b61ff',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,

    elevation: 6,
  },

  text: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    zIndex: 2,
  },
});
