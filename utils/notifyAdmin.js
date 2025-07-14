// utils/notifyAdmin.js
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const sendNotification = async (employeeId, type, timestamp) => {
  const message = `Employee ${employeeId} ${type === 'entry' ? 'entered' : 'exited'} at ${timestamp}`;
  await addDoc(collection(db, 'notifications'), {
    employeeId,
    message,
    timestamp,
  });
};
