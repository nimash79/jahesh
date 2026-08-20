import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import RefreshIcon from './icons/RefreshIcon';

const RefreshButton = ({ onPress }) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.92)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;

  // Pulse animation
  useEffect(() => {
    const pulseLoop = Animated.loop(
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
    );

    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  // Breathing animation
  useEffect(() => {
    const breatheLoop = Animated.loop(
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
    );

    breatheLoop.start();

    return () => breatheLoop.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} android_ripple={{ color: 'transparent' }}>
        <LinearGradient
          colors={['#ffffff', '#f4f0ff', '#ece6ff']}
          style={styles.button}
        >
          <Animated.View
            style={[
              styles.pulse,
              {
                backgroundColor: 'rgba(123,97,255,0.22)',
                transform: [{ scale: pulseAnim }],
                opacity: pulseOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.core,
              {
                transform: [{ scale: breatheAnim }],
              },
            ]}
          >
            <RefreshIcon color="#7b61ff" width={34} height={34} />
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

export default RefreshButton;

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

    shadowColor: '#7b61ff',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,

    elevation: 6,
  },
});