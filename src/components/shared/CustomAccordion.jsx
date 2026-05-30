import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import ArrowDownIcon from './../icons/ArrowDownIcon';
import { COLORS } from '../../utils/constants';
import CustomText from './CustomText';
import { useIsFocused } from '@react-navigation/native';

const CustomAccordion = ({ title, Icon, children, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused && open) {
      setOpen(false);
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    const next = !open;
    setOpen(next);

    Animated.timing(rotateAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.accContainer, disabled ? { opacity: 0.5 } : {}]}>
      <TouchableWithoutFeedback onPress={toggleAccordion} disabled={disabled}>
        <View style={styles.accHeader}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon color={open ? COLORS.primary : COLORS.neutral40} />
          </Animated.View>
          <CustomText
            style={[styles.accTitle, open ? { color: COLORS.primary } : {}]}
          >
            {title}
          </CustomText>

          <Animated.View style={{ transform: [{ rotate }] }}>
            <ArrowDownIcon />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {open && <View style={styles.accContent}>{children}</View>}
    </View>
  );
};

export default CustomAccordion;

const styles = StyleSheet.create({
  accContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  accHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: COLORS.backSections,
    alignItems: 'center',
  },
  accTitle: { marginInlineStart: 16, flex: 1 },
  accContent: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.44,
    shadowRadius: 2.22,

    elevation: 3,
  },
});
