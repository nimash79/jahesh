import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const isAuthenticated = () => {
    const token = AsyncStorage.getItem('token');
    if (token) return true;
    else return false;
}

export const decode_token = (token) => {
    return jwtDecode(token);
}