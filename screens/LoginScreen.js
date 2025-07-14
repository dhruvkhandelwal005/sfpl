import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [securityName, setSecurityName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const storedRole = await AsyncStorage.getItem('userRole');
    if (storedRole) navigation.replace('Home');
  };

  const handleSecurityLogin = async () => {
    if (!securityName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    await AsyncStorage.setItem('userRole', 'security');
    await AsyncStorage.setItem('securityName', securityName.trim());
    navigation.replace('Home');
  };

  const handleAdminLogin = async () => {
    if (adminPassword !== 'sfpl@admin001') {
      Alert.alert('Error', 'Incorrect password');
      return;
    }
    await AsyncStorage.setItem('userRole', 'admin');
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Security Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TextInput
          placeholder="Enter your name"
          value={securityName}
          onChangeText={setSecurityName}
          style={styles.input}
        />
        <Pressable
          onPress={handleSecurityLogin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Login as Security</Text>
        </Pressable>
      </View>

      {/* Admin Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin</Text>
        <TextInput
          placeholder="Enter admin password"
          value={adminPassword}
          onChangeText={setAdminPassword}
          secureTextEntry
          style={styles.input}
        />
        <Pressable
          onPress={handleAdminLogin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Login as Admin</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#CAD7DF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});