import {
  DASHBOARD_ROLE_OPTIONS,
  DEPARTMENT_OPTIONS,
  DESIGNATION_OPTIONS,
  DashboardRole,
  EmployeeFormData,
} from '@/app-models-settings/routing-directory/routing-directory.model';

import * as XLSX from 'xlsx';

export const REQUIRED_HEADERS = [
  'First Name',
  'Last Name',
  'Designation',
  'Department',
  'Phone Number',
  'Extension',
  'Email',
  'Dashboard Access',
  'Dashboard Role',
  'Call Transfer Eligible',
] as const;

export type RequiredHeader = (typeof REQUIRED_HEADERS)[number];

export interface RowValidationError {
  field: RequiredHeader;
  message: string;
}

export interface InvalidRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: RowValidationError[];
}

export interface XlsxValidationResult {
  valid: boolean;
  missingHeaders: string[];
  invalidRows: InvalidRow[];
  validRows: EmployeeFormData[];
}

const VALID_DESIGNATIONS = new Set(DESIGNATION_OPTIONS.map((o) => o.value));
const VALID_DEPARTMENTS = new Set(DEPARTMENT_OPTIONS.map((o) => o.value));
const VALID_DASHBOARD_ROLES = new Set(
  DASHBOARD_ROLE_OPTIONS.map((o) => o.value)
);

const parseBoolean = (raw: string): boolean | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return false;
  if (['true', 'yes', 'y', '1', 'on', 'enabled'].includes(v)) return true;
  if (['false', 'no', 'n', '0', 'off', 'disabled'].includes(v)) return false;
  return null;
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

const parsePhoneDetails = (
  fullPhone: string
): { isdCode: string; phoneNumber: string } => {
  const digits = fullPhone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return { isdCode: '+1', phoneNumber: digits.slice(1) };
  }
  return { isdCode: '', phoneNumber: digits };
};

function validateRow(raw: Record<string, string>): {
  errors: RowValidationError[];
  formData: EmployeeFormData | null;
} {
  const errors: RowValidationError[] = [];

  const firstName = raw['First Name']?.trim() ?? '';
  const lastName = raw['Last Name']?.trim() ?? '';
  const designation = raw['Designation']?.trim() ?? '';
  const department = raw['Department']?.trim() ?? '';
  const phone = raw['Phone Number']?.trim() ?? '';
  const extension = raw['Extension']?.trim() ?? '';
  const email = raw['Email']?.trim() ?? '';
  const dashboardAccessRaw = raw['Dashboard Access']?.trim() ?? '';
  const dashboardRoleRaw = raw['Dashboard Role']?.trim().toLowerCase() ?? '';
  const callTransferRaw = raw['Call Transfer Eligible']?.trim() ?? '';

  if (!firstName) {
    errors.push({ field: 'First Name', message: 'First name is required' });
  }
  if (!lastName) {
    errors.push({ field: 'Last Name', message: 'Last name is required' });
  }

  if (!designation) {
    errors.push({ field: 'Designation', message: 'Designation is required' });
  } else if (!VALID_DESIGNATIONS.has(designation)) {
    errors.push({
      field: 'Designation',
      message: `"${designation}" is not a valid designation. Must be one of: ${[...VALID_DESIGNATIONS].join(', ')}`,
    });
  }

  if (!department) {
    errors.push({ field: 'Department', message: 'Department is required' });
  } else if (!VALID_DEPARTMENTS.has(department)) {
    errors.push({
      field: 'Department',
      message: `"${department}" is not a valid department. Must be one of: ${[...VALID_DEPARTMENTS].join(', ')}`,
    });
  }

  if (!phone) {
    errors.push({ field: 'Phone Number', message: 'Phone number is required' });
  } else if (!PHONE_REGEX.test(phone)) {
    errors.push({
      field: 'Phone Number',
      message: 'Phone number is not valid',
    });
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'Email', message: 'Email is not valid' });
  }

  const dashboardAccess = parseBoolean(dashboardAccessRaw);
  if (dashboardAccess === null) {
    errors.push({
      field: 'Dashboard Access',
      message: 'Use Yes/No or true/false',
    });
  }

  let dashboardRole: DashboardRole | '' = '';
  if (dashboardAccess) {
    if (!dashboardRoleRaw) {
      errors.push({
        field: 'Dashboard Role',
        message: 'Required when dashboard access is enabled',
      });
    } else if (!VALID_DASHBOARD_ROLES.has(dashboardRoleRaw as DashboardRole)) {
      errors.push({
        field: 'Dashboard Role',
        message: `Must be one of: ${[...VALID_DASHBOARD_ROLES].join(', ')}`,
      });
    } else {
      dashboardRole = dashboardRoleRaw as DashboardRole;
    }
  }

  const callTransferEligible = parseBoolean(callTransferRaw);
  if (callTransferEligible === null) {
    errors.push({
      field: 'Call Transfer Eligible',
      message: 'Use Yes/No or true/false',
    });
  }

  if (errors.length > 0) {
    return { errors, formData: null };
  }

  const { isdCode, phoneNumber } = parsePhoneDetails(phone);

  return {
    errors: [],
    formData: {
      firstName,
      lastName,
      designation,
      dashboardRole,
      canAccessDashboard: dashboardAccess ?? false,
      callTransferEligible: callTransferEligible ?? false,
      department,
      isdCode,
      phoneNumber,
      extension,
      email,
    },
  };
}

export async function validateXlsxFile(
  file: File
): Promise<XlsxValidationResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
  });

  if (rows.length === 0) {
    return {
      valid: false,
      missingHeaders: [...REQUIRED_HEADERS],
      invalidRows: [],
      validRows: [],
    };
  }

  const presentHeaders = Object.keys(rows[0]);
  const missingHeaders = REQUIRED_HEADERS.filter(
    (h) => !presentHeaders.includes(h)
  );

  if (missingHeaders.length > 0) {
    return { valid: false, missingHeaders, invalidRows: [], validRows: [] };
  }

  const invalidRows: InvalidRow[] = [];
  const validRows: EmployeeFormData[] = [];

  rows.forEach((raw, index) => {
    const rowNumber = index + 2; // +2: 1-indexed + header row
    const { errors, formData } = validateRow(raw);
    if (errors.length > 0) {
      invalidRows.push({ rowNumber, data: raw, errors });
    } else if (formData) {
      validRows.push(formData);
    }
  });

  return {
    valid: invalidRows.length === 0,
    missingHeaders: [],
    invalidRows,
    validRows,
  };
}
