import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const AnimatedOutlet = ({ children, direction }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const translateX = useSharedValue(direction * width);

  useEffect(() => {
    const sign = isRTL ? -1 : 1;
    translateX.value = sign * direction * width;

    translateX.value = withTiming(0, {
      duration: 400,
    });
  }, [direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: withTiming(1, { duration: 400 }),
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedOutlet;