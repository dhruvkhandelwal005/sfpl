import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveLogin = async (role) => {
  await AsyncStorage.setItem("userRole", role);
};

export const getLogin = async () => {
  return await AsyncStorage.getItem("userRole");
};

export const logout = async () => {
  await AsyncStorage.removeItem("userRole");
};
