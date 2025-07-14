// utils/excelExport.js
import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

export const exportToExcel = async (records, employeesMap) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    // Headers
    sheet.columns = [
      { header: 'Employee Name', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Time', key: 'timestamp', width: 30 },
      { header: 'Marked By', key: 'markedBy', width: 20 },
    ];

    // Data
    records.forEach((rec) => {
      sheet.addRow({
        name: employeesMap[rec.employeeId] || rec.employeeId,
        type: rec.type.toUpperCase(),
        timestamp: new Date(rec.timestamp).toLocaleString(),
        markedBy: rec.markedBy,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer(); // <- NOT `write()`, use `writeBuffer()`
    const uint8Array = new Uint8Array(buffer);
    const base64 = Buffer.from(uint8Array).toString('base64');

    const fileUri = FileSystem.documentDirectory + `Attendance_${Date.now()}.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri);
    } else {
      alert('Sharing not available on this device.');
    }
  } catch (error) {
    console.error('Excel export failed:', error);
    alert('Failed to export Excel. Please try again.');
  }
};
