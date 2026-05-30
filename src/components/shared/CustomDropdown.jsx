import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import CustomText from './CustomText';
import { COLORS } from '../../utils/constants';

const CustomDropdown = ({
  options = [],
  value,
  setValue,
  placeholder = '',
  containerStyle = {},
}) => {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.value === value);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Pressable
        style={styles.button}
        onPress={() => setOpen(o => !o)}
      >
        <Text style={styles.text}>
          {selected ? selected.text : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      {open && (
        <>
          {/* overlay برای بستن dropdown */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.optionsContainer}>
            {options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => {
                  setValue(option.value);
                  setOpen(false);
                }}
              >
                <CustomText style={styles.optionText}>{option.text}</CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },

  button: {
    height: 38,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  text: {
    fontSize: 14,
  },

  arrow: {
    fontSize: 12,
  },

  optionsContainer: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    zIndex: 10,
  },

  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  optionText: {
    fontSize: 14,
    color: COLORS.neutral40,
  },
});
