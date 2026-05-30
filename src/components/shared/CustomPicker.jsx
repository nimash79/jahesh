import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../utils/constants';
import CustomText from './CustomText';

const CustomPicker = ({
  options,
  selectedValue,
  onValueChange,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Picker
        style={styles.picker}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
      >
        {options.map(n => (
          <Picker.Item
            style={styles.pickerItem}
            label={n.label}
            value={n.value}
            key={n.value}
          />
        ))}
      </Picker>
    </View>
  );
};

export default CustomPicker;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.neutral40,
    borderRadius: 14,
  },
  picker: {
    width: '100%',
    color: COLORS.neutral40,
    fontFamily: 'Shabnam-Regular',
  },
  pickerItem: { fontFamily: 'Shabnam-Regular' },
});
