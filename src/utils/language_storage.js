import AsyncStorage from "@react-native-async-storage/async-storage";

export const addLanguage = async (lang) => {
  await AsyncStorage.setItem("language", lang);
}

export const getLanguage = async () => {
  return AsyncStorage.getItem("language");
}

export const removeLanguage = async () => {
  return AsyncStorage.removeItem("language");
}