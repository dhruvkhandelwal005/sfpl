// App.js
// App.js
import { Buffer } from 'buffer';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import MarkAttendanceScreen from './screens/MarkAttendanceScreen';
import AddEmployeeScreen from './screens/AddEmployeeScreen';
import AttendanceRecordsScreen from './screens/AttendanceRecordsScreen';

if (!global.Buffer) global.Buffer = Buffer;
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
        <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
        <Stack.Screen name="AttendanceRecords" component={AttendanceRecordsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
