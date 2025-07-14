import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

export default function MarkAttendanceScreen() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [type, setType] = useState('entry');
  const [markedBy, setMarkedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      await fetchEmployees();
      await getSecurityName();
      setFetching(false);
    };
    initializeData();
  }, []);

  const getSecurityName = async () => {
    const name = await AsyncStorage.getItem('securityName');
    const role = await AsyncStorage.getItem('userRole');
    setMarkedBy(role === 'admin' ? 'Admin' : name || 'Security');
  };

  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch employees');
      console.error(error);
    }
  };

  const markAttendance = async () => {
    if (!selectedEmployee) {
      return Alert.alert('Required', 'Please select an employee');
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'attendance'), {
        employeeId: selectedEmployee,
        employeeName: employees.find(e => e.id === selectedEmployee)?.name,
        type,
        timestamp: new Date().toISOString(),
        markedBy,
      });
      Alert.alert('Success', `${type === 'entry' ? 'Entry' : 'Exit'} recorded successfully`);
      setSelectedEmployee('');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A6D80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark Attendance</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Employee:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedEmployee}
            onValueChange={setSelectedEmployee}
            style={styles.picker}
            dropdownIconColor="#5A6D80"
          >
            <Picker.Item label="Select Employee" value="" />
            {employees.map((emp) => (
              <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={setType}
            style={styles.picker}
            dropdownIconColor="#5A6D80"
          >
            <Picker.Item label="Entry" value="entry" />
            <Picker.Item label="Exit" value="exit" />
          </Picker>
        </View>
      </View>

      <Text style={styles.markedByText}>Marked by: {markedBy}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          (!selectedEmployee || loading) && styles.buttonDisabled
        ]}
        onPress={markAttendance}
        disabled={!selectedEmployee || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {type === 'entry' ? 'Mark Entry' : 'Mark Exit'}
          </Text>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CAD7DF',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  markedByText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#5A6D80',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: '#9BA8B7',
  },
});