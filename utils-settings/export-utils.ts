import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export interface ExportConversationData {
  name: string;
  contactNumber: string;
  email: string;
  date: string;
  time: string;
  duration: string;
  customerIntent: string;
  vehicle: string;
  sentiment: string;
  aiScore: string;
  actionItems: string;
  notes: string;
}

// Function to properly escape CSV fields
const escapeCSVField = (field: string): string => {
  if (field === null || field === undefined) {
    return '""';
  }

  const stringField = String(field);

  // If the field contains comma, newline, or double quote, it needs to be quoted
  if (
    stringField.includes(',') ||
    stringField.includes('\n') ||
    stringField.includes('\r') ||
    stringField.includes('"')
  ) {
    // Escape double quotes by doubling them
    const escapedField = stringField.replace(/"/g, '""');
    return `"${escapedField}"`;
  }

  return stringField;
};

export const exportToCsv = (
  data: ExportConversationData[],
  filename: string = 'conversations.csv'
) => {
  // Define CSV headers
  const headers = [
    'Name',
    'Contact number',
    'Email',
    'Date',
    'Time',
    'Duration',
    'Customer Intent',
    'Vehicle',
    'Sentiment',
    'AI score',
    'Action Items',
    'Notes',
  ];

  // Convert data to CSV format with proper escaping
  const csvRows = [
    // Header row
    headers.map(escapeCSVField).join(','),
    // Data rows
    ...data.map((row) =>
      [
        escapeCSVField(row.name || ''),
        escapeCSVField(row.contactNumber || ''),
        escapeCSVField(row.email || ''),
        escapeCSVField(row.date || ''),
        escapeCSVField(row.time || ''),
        escapeCSVField(row.duration || ''),
        escapeCSVField(row.customerIntent || ''),
        escapeCSVField(row.vehicle || ''),
        escapeCSVField(row.sentiment || ''),
        escapeCSVField(row.aiScore || ''),
        escapeCSVField(row.actionItems || ''),
        escapeCSVField(row.notes || ''),
      ].join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToXlsx = (
  data: ExportConversationData[],
  filename: string = 'conversations.xlsx'
) => {
  // Define headers
  const headers = [
    'Name',
    'Contact number',
    'Email',
    'Date',
    'Time',
    'Duration',
    'Customer Intent',
    'Vehicle',
    'Sentiment',
    'AI score',
    'Action Items',
    'Notes',
  ];

  // Convert data to worksheet format
  const worksheetData = [
    headers,
    ...data.map((row) => [
      row.name || '',
      row.contactNumber || '',
      row.email || '',
      row.date || '',
      row.time || '',
      row.duration || '',
      row.customerIntent || '',
      row.vehicle || '',
      row.sentiment || '',
      row.aiScore || '',
      row.actionItems || '',
      row.notes || '',
    ]),
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Name
    { wch: 15 }, // Contact number
    { wch: 25 }, // Email
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 12 }, // Duration
    { wch: 20 }, // Customer Intent
    { wch: 20 }, // Vehicle
    { wch: 12 }, // Sentiment
    { wch: 10 }, // AI score
    { wch: 12 }, // Action Items
    { wch: 30 }, // Notes
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Conversations');

  // Generate XLSX file
  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Download the file
  saveAs(blob, filename);
};

export const formatConversationForExport = (
  conversation: any
): ExportConversationData => {
  // Parse the createdAt date to separate date and time
  const createdAt = conversation.createdAt || '';
  const dateTimeParts = createdAt.split(',');
  const date = dateTimeParts[0] || '';
  const time = dateTimeParts[2] || '';

  return {
    name: conversation.name || '',
    contactNumber: conversation.phoneNumber || '',
    email: conversation.email || '',
    date: date,
    time: time,
    duration: conversation.callDuration || '',
    customerIntent: conversation.customerIntent || '',
    vehicle: conversation.vehicle || '',
    sentiment: conversation.customerSentiment || '',
    aiScore: conversation.aiQualityScore?.toString() || '',
    actionItems: conversation.actionItemCount?.toString() || '',
    notes: conversation.notes || '',
  };
};
