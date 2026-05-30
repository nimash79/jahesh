import { StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../../utils/constants';

const CustomInput = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={COLORS.neutral60}
      {...props}
    />
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 12,
    paddingHorizontal: 24,
    height: 38,
    color: COLORS.neutral40,
    borderColor: COLORS.neutral40,
    fontFamily: "Shabnam-Regular",
  },
});
