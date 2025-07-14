import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [role, setRole] = useState('');
  const [securityName, setSecurityName] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const storedRole = await AsyncStorage.getItem('userRole');
    const secName = await AsyncStorage.getItem('securityName');
    setRole(storedRole);
    setSecurityName(secName || '');
  };

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        {role === 'admin' ? 'Admin Dashboard' : `Welcome, ${securityName}`}
      </Text>

      {/* Common Actions */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => navigation.navigate('MarkAttendance')}
      >
        <Text style={styles.buttonText}>Mark Attendance</Text>
      </Pressable>

      {/* Admin-Only Actions */}
      {role === 'admin' && (
        <>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('AddEmployee')}
          >
            <Text style={styles.buttonText}>Add Employee</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('AttendanceRecords')}
          >
            <Text style={styles.buttonText}>View Attendance Records</Text>
          </Pressable>
        </>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 32,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#CAD7DF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});