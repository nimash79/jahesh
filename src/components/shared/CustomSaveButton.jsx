import { StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { useSelector } from 'react-redux';

const CustomSaveButton = ({ onPress }) => {
  const { t } = useTranslation();
  const sendMethod = useSelector(state => state.sendMethod);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <CustomText style={styles.text}>
        {sendMethod === 'wifi' ? t('common:save') : t('common:send')}
      </CustomText>
    </TouchableOpacity>
  );
};

export default CustomSaveButton;

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: COLORS.success,
    borderRadius: 14,
    alignItems: 'center',
  },
  text: { color: COLORS.neutral_f9 },
});
