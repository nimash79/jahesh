import {toast} from 'react-toastify';
import i18n from '../localization/i18n';

import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
  SuccessToast,
} from "react-native-toast-message";

export const toastConfig = {
  /*
      Overwrite 'error' type,
      by modifying the existing `ErrorToast` component
    */
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontFamily: "Shabnam-Regular",
        fontSize: 16,
      }}
      text2Style={{
        fontFamily: "Shabnam-Regular",
        fontSize: 14,
      }}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={{ borderLeftColor: "#7B61FF" }}
      text1Style={{ fontFamily: "Shabnam-Regular", fontSize: 16 }}
      text2Style={{ fontFamily: "Shabnam-Regular", fontSize: 14 }}
    />
  ),
  success: (props) => (
    <SuccessToast
      {...props}
      style={{ borderLeftColor: "#7B61FF" }}
      text1Style={{ fontFamily: "Shabnam-Regular", fontSize: 16 }}
      text2Style={{ fontFamily: "Shabnam-Regular", fontSize: 14 }}
    />
  ),
};

export const notif_error = (title = "خطا", message = "مشکلی پیش آمده است!") => {
  Toast.show({
    position: "top",
    type: "error",
    text1: title,
    text2: message,
  });
};

export const notif_success = (title = "", message) => {
  Toast.show({
    position: "top",
    type: "success",
    text1: title,
    text2: message,
  });
};

export const notif_warning = (title = "", message) => {
  Toast.show({
    position: "top",
    type: "info",
    text1: title,
    text2: message,
  });
};
