// Campaign Setup Utility Functions
import { CampaignTypesResponse } from '@/types/campaign-api.types';

export function formatCamelCaseToTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/^./, (char) => char.toUpperCase()); // Capitalize first letter
}

export interface UseCase {
  label: string;
  subCases: Array<{
    value: string;
    label: string;
  }>;
}

/**
 * Get dynamic use cases based on campaign types response
 */
export function getDynamicUseCases(
  campaignTypes: CampaignTypesResponse | null
): Record<string, UseCase> {
  if (!campaignTypes) {
    return {};
  }

  const result: Record<string, UseCase> = {};

  if (campaignTypes.sales) {
    result.sales = campaignTypes.sales;
  }

  if (campaignTypes.service) {
    result.service = campaignTypes.service;
  }

  return result;
}

/**
 * Get required keys/fields for a specific use case — prefers API campaign types
 * (sales/service subCases with requiredKeys) when loaded; falls back to hardcoded lists.
 */
export function getRequiredKeysForUseCase(
  subUseCase: string,
  category: string,
  campaignTypes?: CampaignTypesResponse | null
): string[] {
  const normalizedCategory = category.toLowerCase() as 'sales' | 'service';

  // Primary: read from backend campaign types (sales + service) when available
  if (campaignTypes) {
    const categoryData = campaignTypes[normalizedCategory];
    if (categoryData?.subCases) {
      const normalizedSubUseCase = subUseCase
        .toLowerCase()
        .replace(/[\s_-]/g, '');
      const matchedSubCase = categoryData.subCases.find((subCase) => {
        const normalizedValue = subCase.value
          .toLowerCase()
          .replace(/[\s_-]/g, '');
        return normalizedValue === normalizedSubUseCase;
      });

      if (matchedSubCase?.requiredKeys) {
        const activeKeys = matchedSubCase.requiredKeys
          .filter((key) => key.isActive)
          .map((key) => key.name);
        if (activeKeys.length > 0) {
          return activeKeys;
        }
      }
    }
  }

  // Fallback: hardcoded fields when campaign types are not yet loaded
  const salesRequiredFields = [
    'LeadStatus',
    'LeadType',
    'CustomerCreatedUTC',
    'LeadCreatedUTC',
    'LeadSource',
    'SalesPersonFullName',
    'CustomerFullName',
    'Address',
    'City',
    'State',
    'PostalCode',
    'ContactPhoneNumber',
    'Email',
    'CallConsent',
    'EmailConsent',
    'SMSConsent',
    'VehicleYear',
    'VehicleMake',
    'VehicleModel',
    'VehicleVIN',
    'VehicleStockNumber',
    'SoldDateUTC',
  ];

  const serviceRequiredFields = [
    'CustomerFullName',
    'ContactPhoneNumber',
    'VehicleVIN',
    'RecallDescription',
    'VehicleMake',
    'VehicleModel',
    'VehicleYear',
    'PartsAvailabilityFlag',
    'LoanerEligibility',
    'Symptom',
    'RiskDetails',
    'RemedySteps',
    'CustomerEmail',
    'CallConsent',
    'EmailConsent',
    'SMSConsent',
  ];

  if (normalizedCategory === 'sales') {
    return salesRequiredFields;
  }

  if (normalizedCategory === 'service') {
    return serviceRequiredFields;
  }

  return [];
}

/**
 * Column headers for generated sample Excel files (full column set)
 */
export function getSampleExcelFields(category: string): string[] {
  const salesCsvFields = [
    'LeadStatus',
    'LeadType',
    'CustomerCreatedUTC',
    'LeadCreatedUTC',
    'LeadSource',
    'SalesPersonFullName',
    'CustomerFullName',
    'Address',
    'City',
    'State',
    'PostalCode',
    'ContactPhoneNumber',
    'Email',
    'CallConsent',
    'EmailConsent',
    'SMSConsent',
    'VehicleYear',
    'VehicleMake',
    'VehicleModel',
    'VehicleVIN',
    'VehicleStockNumber',
    'SoldDateUTC',
  ];

  const serviceCsvFields = [
    'CustomerFullName',
    'ContactPhoneNumber',
    'VehicleVIN',
    'RecallDescription',
    'VehicleMake',
    'VehicleModel',
    'VehicleYear',
    'PartsAvailabilityFlag',
    'LoanerEligibility',
    'Symptom',
    'RiskDetails',
    'RemedySteps',
    'CustomerEmail',
    'CallConsent',
    'EmailConsent',
    'SMSConsent',
  ];

  return category === 'sales' ? salesCsvFields : serviceCsvFields;
}

/**
 * Get sample CSV URL for a specific use case from campaign types data
 */
export function getSampleCsvUrl(
  subUseCase: string,
  category: string,
  campaignTypes: CampaignTypesResponse | null
): string | null {
  const normalizedCategory = category.toLowerCase() as 'sales' | 'service';
  if (campaignTypes && campaignTypes[normalizedCategory]) {
    const categoryData = campaignTypes[normalizedCategory];
    if (categoryData?.subCases) {
      const subCase = categoryData.subCases.find(
        (sc: { value: string }) => sc.value === subUseCase
      );
      const raw = subCase?.sampleCsv;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
    }
  }
  return null;
}

function filenameFromContentDisposition(
  contentDisposition: string | null
): string | null {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(
    /filename\*=(?:UTF-8'')?([^;\n]+)/i
  );
  if (utf8Match) {
    const raw = utf8Match[1].replace(/^["']|["']$/g, '').trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  const fnMatch = contentDisposition.match(
    /filename=(?:UTF-8'')?["']?([^"';\n]+)["']?/i
  );
  return fnMatch ? fnMatch[1].trim() : null;
}

function deriveRemoteSampleFilename(
  url: string,
  contentDisposition: string | null,
  contentType: string | null,
  subUseCase: string,
  category: string
): string {
  const fromHeader = filenameFromContentDisposition(contentDisposition);
  if (fromHeader) return fromHeader;

  try {
    const path = new URL(url).pathname;
    const base = path.split('/').filter(Boolean).pop();
    if (base && base.includes('.')) {
      return decodeURIComponent(base);
    }
  } catch {
    // ignore invalid URL
  }

  const ct = (contentType || '').toLowerCase();
  let ext = 'bin';
  if (
    ct.includes('spreadsheetml') ||
    ct.includes('ms-excel') ||
    ct.includes('excel')
  ) {
    ext = 'xlsx';
  } else if (ct.includes('csv') || ct.includes('text/plain')) {
    ext = 'csv';
  } else if (url.toLowerCase().includes('.xlsx')) {
    ext = 'xlsx';
  } else if (url.toLowerCase().includes('.csv')) {
    ext = 'csv';
  }

  return `sample-${category}-${subUseCase}.${ext}`;
}

/**
 * Fetches a remote sample template (CSV/XLSX from API `sampleCsv`) and triggers a file download.
 * @returns true if the download was triggered successfully
 */
export async function tryDownloadSampleFromRemoteUrl(
  url: string,
  subUseCase: string,
  category: string
): Promise<boolean> {
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) {
      return false;
    }
    const blob = await response.blob();
    const filename = deriveRemoteSampleFilename(
      url,
      response.headers.get('Content-Disposition'),
      response.headers.get('Content-Type'),
      subUseCase,
      category
    );
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download a sample Excel file for a campaign (frontend-generated columns and rows)
 */
export async function downloadSampleFile(
  subUseCase: string,
  category: string,
  campaignTypes?: CampaignTypesResponse | null
): Promise<void> {
  const remoteUrl = getSampleCsvUrl(
    subUseCase,
    category,
    campaignTypes ?? null
  );
  if (remoteUrl) {
    const downloaded = await tryDownloadSampleFromRemoteUrl(
      remoteUrl,
      subUseCase,
      category
    );
    if (downloaded) {
      return;
    }
    console.warn(
      'Could not download sample from API URL (CORS or network). Falling back to generated template.',
      remoteUrl
    );
  }

  const columnFields = getSampleExcelFields(category);

  if (columnFields.length === 0) {
    console.warn('No sample columns configured for this category');
    return;
  }

  const sampleRow1: string[] = [];
  const sampleRow2: string[] = [];

  columnFields.forEach((field) => {
    const fieldLower = field.toLowerCase();

    // Lead Status
    if (fieldLower === 'leadstatus') {
      sampleRow1.push('New');
      sampleRow2.push('Follow-up');
    }
    // Lead Type
    else if (fieldLower === 'leadtype') {
      sampleRow1.push('Internet');
      sampleRow2.push('Walk-in');
    }
    // Lead Source
    else if (fieldLower === 'leadsource') {
      sampleRow1.push('Website');
      sampleRow2.push('Referral');
    }
    // Sales Person Full Name
    else if (fieldLower === 'salespersonfullname') {
      sampleRow1.push('Mike Johnson');
      sampleRow2.push('Sarah Williams');
    }
    // Customer Full Name
    else if (fieldLower === 'customerfullname') {
      sampleRow1.push('John Doe');
      sampleRow2.push('Jane Smith');
    }
    // First name (legacy)
    else if (fieldLower.includes('first') && fieldLower.includes('name')) {
      sampleRow1.push('John');
      sampleRow2.push('Jane');
    }
    // Last name (legacy)
    else if (fieldLower.includes('last') && fieldLower.includes('name')) {
      sampleRow1.push('Doe');
      sampleRow2.push('Smith');
    }
    // Generic name field
    else if (
      fieldLower.includes('name') &&
      !fieldLower.includes('first') &&
      !fieldLower.includes('last')
    ) {
      sampleRow1.push('John Doe');
      sampleRow2.push('Jane Smith');
    }
    // Contact Phone Number
    else if (
      fieldLower === 'contactphonenumber' ||
      fieldLower.includes('phone')
    ) {
      sampleRow1.push('+1234567890');
      sampleRow2.push('+0987654321');
    }
    // Email
    else if (fieldLower === 'email') {
      sampleRow1.push('john.doe@example.com');
      sampleRow2.push('jane.smith@example.com');
    }
    // Consent fields (Call, Email, SMS)
    else if (
      fieldLower === 'callconsent' ||
      fieldLower === 'emailconsent' ||
      fieldLower === 'smsconsent'
    ) {
      sampleRow1.push('false');
      sampleRow2.push('false');
    }
    // Address
    else if (fieldLower === 'address') {
      sampleRow1.push('123 Main St');
      sampleRow2.push('456 Oak Ave');
    }
    // City
    else if (fieldLower === 'city') {
      sampleRow1.push('Los Angeles');
      sampleRow2.push('New York');
    }
    // State
    else if (fieldLower === 'state') {
      sampleRow1.push('CA');
      sampleRow2.push('NY');
    }
    // Postal Code
    else if (fieldLower === 'postalcode') {
      sampleRow1.push('90001');
      sampleRow2.push('10001');
    }
    // UTC Date fields (CustomerCreatedUTC, LeadCreatedUTC, SoldDateUTC)
    else if (fieldLower.includes('utc') || fieldLower.includes('date')) {
      sampleRow1.push('2024-12-20T10:30:00Z');
      sampleRow2.push('2024-12-21T14:45:00Z');
    }
    // Time fields
    else if (fieldLower.includes('time')) {
      sampleRow1.push('14:30');
      sampleRow2.push('10:00');
    }
    // Vehicle VIN
    else if (fieldLower.includes('vin')) {
      sampleRow1.push('1HGBH41JXMN109186');
      sampleRow2.push('2HGBH41JXMN109187');
    }
    // Vehicle Stock Number
    else if (
      fieldLower === 'vehiclestocknumber' ||
      fieldLower.includes('stock')
    ) {
      sampleRow1.push('STK12345');
      sampleRow2.push('STK67890');
    }
    // Vehicle Make
    else if (fieldLower.includes('make')) {
      sampleRow1.push('Toyota');
      sampleRow2.push('Honda');
    }
    // Vehicle Model
    else if (fieldLower.includes('model')) {
      sampleRow1.push('Camry');
      sampleRow2.push('Accord');
    }
    // Vehicle Year
    else if (fieldLower.includes('year')) {
      sampleRow1.push('2023');
      sampleRow2.push('2024');
    }
    // Customer Email
    else if (fieldLower === 'customeremail') {
      sampleRow1.push('john.doe@example.com');
      sampleRow2.push('jane.smith@example.com');
    }
    // Recall Description
    else if (fieldLower === 'recalldescription') {
      sampleRow1.push('Airbag Inflator Replacement');
      sampleRow2.push('Brake Line Inspection');
    }
    // Parts Availability Flag
    else if (fieldLower === 'partsavailabilityflag') {
      sampleRow1.push('true');
      sampleRow2.push('false');
    }
    // Loaner Eligibility
    else if (fieldLower === 'loanereligibility') {
      sampleRow1.push('true');
      sampleRow2.push('true');
    }
    // Symptom
    else if (fieldLower === 'symptom') {
      sampleRow1.push('Warning light on dashboard');
      sampleRow2.push('Unusual noise from brakes');
    }
    // Risk Details
    else if (fieldLower === 'riskdetails') {
      sampleRow1.push('High risk - immediate action required');
      sampleRow2.push('Medium risk - schedule within 30 days');
    }
    // Remedy Steps
    else if (fieldLower === 'remedysteps') {
      sampleRow1.push('Replace airbag inflator module');
      sampleRow2.push('Inspect and replace brake lines if needed');
    }
    // Default fallback
    else {
      sampleRow1.push('Sample Value 1');
      sampleRow2.push('Sample Value 2');
    }
  });

  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.aoa_to_sheet([
    columnFields,
    sampleRow1,
    sampleRow2,
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
  const buffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `sample-${category}-${subUseCase}.xlsx`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Validate campaign name
 */
export function validateCampaignName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 50;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Accept various phone formats
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${hours}h ${mins}m`;
}
