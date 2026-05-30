import { StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';

const CustomButton = ({ text, style, textStyle, icon, onPress, outline = false }) => {
  return (
    <TouchableOpacity style={[styles.container, outline ? styles.outline : {}, style]} onPress={onPress}>
        {icon}
      <CustomText style={[styles.text, outline ? styles.textOutline : {}, textStyle]}>{text}</CustomText>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    display: "flex",
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  text: { color: COLORS.neutral_f9, marginInlineStart: 8 },
  textOutline: {
    color: COLORS.primary,
  },
});
