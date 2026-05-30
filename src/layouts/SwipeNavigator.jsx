import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const routes = ['Home', 'Contacts', 'Device', 'Zone'];

const { width } = Dimensions.get('window');

const SwipeNavigator = ({ children }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { i18n } = useTranslation();

  const isRTL = i18n.dir() === 'rtl';
  const currentIndex = routes.indexOf(route.name);
  const [direction, setDirection] = useState(0);

  const goNext = () => {
    if (currentIndex < routes.length - 1) {
      setDirection(1);
      navigation.navigate(routes[currentIndex + 1]);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      navigation.navigate(routes[currentIndex - 1]);
    }
  };

  const onGestureEvent = event => {
    const dx = event.nativeEvent.translationX;

    if (dx < -width * 0.3) {
      isRTL ? goPrev() : goNext();
    } else if (dx > width * 0.3) {
      isRTL ? goNext() : goPrev();
    }
  };

  return (
    <PanGestureHandler
      onEnded={onGestureEvent}
      activeOffsetX={[-20, 20]}
      failOffsetY={[-20, 20]}
    >
      <View style={{ flex: 1 }}>
        {typeof children === 'function' ? children(direction) : children}
      </View>
    </PanGestureHandler>
  );
};

export default SwipeNavigator;
