import {
  ActivityIndicator,
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import CustomButton from './../shared/CustomButton';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../icons/CloseIcon';
import { COLORS } from '../../utils/constants';
import CheckmarkIcon from '../icons/CheckmarkIcon';

const CustomLoadingModal = ({
  loading,
  onCancel,
  close,
  status = 'loading',
}) => {
  const { t } = useTranslation();

  const onClose = () => {
    if (status === 'loading') return;
    close();
  };

  return (
    <Modal
      visible={loading}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.loadingOverlay}>
          {status === 'success' ? (
            <CheckmarkIcon width={48} height={48} />
          ) : status === 'error' ? (
            <CloseIcon color={COLORS.error} width={120} height={120} />
          ) : (
            <ActivityIndicator
              size="large"
              style={{
                transform: [{ scale: 1.5 }],
              }}
            />
          )}
          {status === 'loading' ? (
            <CustomButton
              text={t('common:cancel')}
              onPress={onCancel}
              style={{ marginTop: 16, padding: 16 }}
            />
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomLoadingModal;

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999, // Android
  },
});
