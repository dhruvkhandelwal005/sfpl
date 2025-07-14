import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Picker } from '@react-native-picker/picker';
import { exportToExcel } from '../utils/excelExport';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const AttendanceRecordsScreen = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employeesMap, setEmployeesMap] = useState({});
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);

      const empSnap = await getDocs(collection(db, 'employees'));
      const empMap = {};
      const empList = [];
      empSnap.docs.forEach((doc) => {
        empMap[doc.id] = doc.data().name;
        empList.push({ id: doc.id, name: doc.data().name });
      });
      setEmployeesMap(empMap);
      setEmployeeOptions(empList);

      const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecords(data);
      applyFilter(selectedFilter, selectedEmployeeId, data, empMap);
    } catch (err) {
      Alert.alert('Error', 'Failed to load attendance records');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecords();
  }, []);

  const applyFilter = (
    filter = selectedFilter,
    employeeId = selectedEmployeeId,
    allRecords = records,
    empMap = employeesMap
  ) => {
    const now = new Date();
    let filtered = [...allRecords];

    switch (filter) {
      case 'today':
        filtered = filtered.filter((r) => {
          const d = new Date(r.timestamp);
          return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filtered = filtered.filter((r) => {
          const d = new Date(r.timestamp);
          return d >= weekStart && d <= now;
        });
        break;
      case 'month':
        filtered = filtered.filter((r) => {
          const d = new Date(r.timestamp);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        break;
      case 'year':
        filtered = filtered.filter((r) => {
          const d = new Date(r.timestamp);
          return d.getFullYear() === now.getFullYear();
        });
        break;
    }

    if (employeeId) {
      filtered = filtered.filter((r) => r.employeeId === employeeId);
    }

    setFilteredRecords(filtered);
  };

  const handleExport = () => {
    exportToExcel(filteredRecords, employeesMap);
    Alert.alert('Exported', 'Data exported to Excel');
  };

  const handleClearFilteredRecords = async () => {
    if (filteredRecords.length === 0) {
      Alert.alert('Info', 'No records to delete for this filter');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Delete ${filteredRecords.length} filtered records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: deleteRecords, style: 'destructive' },
      ]
    );
  };

  const deleteRecords = async () => {
    try {
      const batch = writeBatch(db);
      filteredRecords.forEach((rec) => {
        batch.delete(doc(db, 'attendance', rec.id));
      });
      await batch.commit();
      Alert.alert('Success', 'Filtered records deleted');
      fetchRecords();
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Failed to delete records');
    }
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDayLabel = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return 'Today';
    }
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  };

  const renderItem = ({ item }) => {
    const name = employeesMap[item.employeeId] || item.employeeId;
    const dateObj = new Date(item.timestamp);

    return (
      <View style={styles.record}>
        <View style={styles.recordHeader}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.typeBadge}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={styles.recordDetails}>
          <Text style={styles.detailText}>Marked by {item.markedBy}</Text>
          <Text style={styles.detailText}>Day: {getDayLabel(dateObj)}</Text>
          <Text style={styles.detailText}>Time: {formatTime(dateObj)}</Text>
          <Text style={styles.detailText}>Date: {formatDate(dateObj)}</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A6D80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attendance Records</Text>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5A6D80']} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="info-outline" size={36} color="#888" />
            <Text style={styles.emptyText}>No records</Text>
          </View>
        }
      />

      {/* Floating Button */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      >
        <MaterialIcons name="filter-list" size={28} color="white" />
      </Pressable>

      {/* Modal for Filter Options */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter & Export</Text>

            <Text style={styles.modalLabel}>Time Filter</Text>
            <Picker
              selectedValue={selectedFilter}
              onValueChange={(val) => {
                setSelectedFilter(val);
                applyFilter(val, selectedEmployeeId);
              }}
            >
              <Picker.Item label="All Records" value="all" />
              <Picker.Item label="Today" value="today" />
              <Picker.Item label="This Week" value="week" />
              <Picker.Item label="This Month" value="month" />
              <Picker.Item label="This Year" value="year" />
            </Picker>

            <Text style={styles.modalLabel}>Employee</Text>
            <Picker
              selectedValue={selectedEmployeeId}
              onValueChange={(val) => {
                setSelectedEmployeeId(val);
                applyFilter(selectedFilter, val);
              }}
            >
              <Picker.Item label="All Employees" value="" />
              {employeeOptions.map((emp) => (
                <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
              ))}
            </Picker>

            <View style={styles.modalActions}>
              <Pressable onPress={handleExport} style={[styles.actionBtn, { backgroundColor: '#4caf50' }]}>
                <MaterialIcons name="file-download" size={20} color="#fff" />
                <Text style={styles.btnText}>Export</Text>
              </Pressable>

              {selectedFilter !== 'all' && (
                <Pressable onPress={handleClearFilteredRecords} style={[styles.actionBtn, { backgroundColor: '#e53935' }]}>
                  <MaterialIcons name="delete" size={20} color="#fff" />
                  <Text style={styles.btnText}>Clear</Text>
                </Pressable>
              )}
            </View>

            <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AttendanceRecordsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  record: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  typeBadge: {
    backgroundColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  recordDetails: { marginTop: 6 },
  detailText: { color: '#555' },
  listContent: { paddingBottom: 60 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#5A6D80',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
});
