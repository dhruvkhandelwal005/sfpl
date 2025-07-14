import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { getLogin } from '../services/storage';

const AddEmployeeScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(list);
    } catch (err) {
      console.error('Error fetching employees:', err);
      Alert.alert('Error', 'Could not load employees.');
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter employee name');
      return;
    }

    setLoading(true);
    try {
      const role = await getLogin();
      await addDoc(collection(db, 'employees'), {
        name: name.trim(),
        createdBy: role,
        createdAt: new Date().toISOString(),
      });
      setName('');
      fetchEmployees();
      Alert.alert('Success', 'Employee added');
    } catch (err) {
      console.error('Error adding employee:', err);
      Alert.alert('Error', 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (employeeId, name) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(employeeId),
        },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
      fetchEmployees();
      Alert.alert('Deleted', 'Employee has been removed');
    } catch (err) {
      console.error('Error deleting employee:', err);
      Alert.alert('Error', 'Failed to delete employee');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => confirmDelete(item.id, item.name)}
      style={styles.employeeCard}
    >
      <Text style={styles.employeeName}>{item.name}</Text>
      <Text style={styles.createdBy}>Added by: {item.createdBy}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Employee</Text>

      <TextInput
        placeholder="Employee Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoFocus
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleAdd}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Add Employee</Text>
        )}
      </Pressable>

      <Text style={styles.subHeader}>Existing Employees</Text>

      {fetching ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No employees added yet.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
    color: '#444',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CAD7DF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#5A6D80',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    backgroundColor: '#9BA8B7',
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#5A6D80',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  createdBy: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AddEmployeeScreen;
