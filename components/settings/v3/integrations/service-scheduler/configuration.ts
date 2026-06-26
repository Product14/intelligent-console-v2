import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';

export const SERVICE_SCHEDULER_PLATFORM = {
  NOT_LISTED: 'not-listed',
  XTIME: 'xtime',
  TEKION: 'tekion',
  PBS: 'pbs',
  CDK: 'cdk',
  DEALERFX: 'dealerfx',
  OTHER: 'other',
} as const;

export type ServiceSchedulerPlatformType =
  (typeof SERVICE_SCHEDULER_PLATFORM)[keyof typeof SERVICE_SCHEDULER_PLATFORM];

export const AVAILABLE_SERVICES: CIDropdownMenuOption[] = [
  // Maintenance
  {
    sectionHeader: 'Maintenance',
    label: 'Conventional Oil Change',
    value: 'OIL_CHANGE_CONVENTIONAL',
  },
  { label: 'Synthetic Oil Change', value: 'OIL_CHANGE_SYNTHETIC' },
  { label: 'Tire Rotation', value: 'TIRE_ROTATION' },
  { label: 'Tire Replacement', value: 'TIRE_REPLACEMENT' },
  { label: 'Wheel Alignment', value: 'WHEEL_ALIGNMENT' },
  { label: 'Brake Inspection', value: 'BRAKE_INSPECTION' },
  { label: 'Brake Pad Replacement', value: 'BRAKE_PAD_REPLACEMENT' },
  { label: 'Battery Replacement', value: 'BATTERY_REPLACEMENT' },
  {
    label: 'Cabin Air Filter Replacement',
    value: 'CABIN_AIR_FILTER_REPLACEMENT',
  },
  {
    label: 'Engine Air Filter Replacement',
    value: 'ENGINE_AIR_FILTER_REPLACEMENT',
  },
  { label: 'Transmission Fluid Service', value: 'TRANSMISSION_FLUID_SERVICE' },
  { label: 'Coolant Flush', value: 'COOLANT_FLUSH' },
  { label: 'Multi-Point Inspection', value: 'MULTI_POINT_INSPECTION' },
  { label: 'State Inspection', value: 'STATE_INSPECTION' },
  { label: 'Emissions Test', value: 'EMISSIONS_TEST', showSeparator: true },
  // Engine & Powertrain Repairs
  {
    sectionHeader: 'Engine & Powertrain Repairs',
    label: 'Minor Engine Repair',
    value: 'ENGINE_REPAIR_MINOR',
  },
  { label: 'Major Engine Repair', value: 'ENGINE_REPAIR_MAJOR' },
  { label: 'Engine Replacement', value: 'ENGINE_REPLACEMENT' },
  { label: 'Transmission Repair', value: 'TRANSMISSION_REPAIR' },
  { label: 'Transmission Replacement', value: 'TRANSMISSION_REPLACEMENT' },
  { label: 'Clutch Replacement', value: 'CLUTCH_REPLACEMENT' },
  { label: 'Axle Replacement', value: 'AXLE_REPLACEMENT', showSeparator: true },
  // Brake & Suspension
  {
    sectionHeader: 'Brake & Suspension',
    label: 'Brake Rotor Replacement',
    value: 'BRAKE_ROTOR_REPLACEMENT',
  },
  { label: 'Brake Caliper Replacement', value: 'BRAKE_CALIPER_REPLACEMENT' },
  { label: 'Strut Replacement', value: 'STRUT_REPLACEMENT' },
  { label: 'Shock Replacement', value: 'SHOCK_REPLACEMENT' },
  {
    label: 'Control Arm Replacement',
    value: 'CONTROL_ARM_REPLACEMENT',
    showSeparator: true,
  },
  // HVAC
  { sectionHeader: 'HVAC', label: 'AC Recharge', value: 'AC_RECHARGE' },
  { label: 'AC Compressor Replacement', value: 'AC_COMPRESSOR_REPLACEMENT' },
  { label: 'Heater Repair', value: 'HEATER_REPAIR' },
  {
    label: 'Blower Motor Replacement',
    value: 'BLOWER_MOTOR_REPLACEMENT',
    showSeparator: true,
  },
  // Electrical & Electronics
  {
    sectionHeader: 'Electrical & Electronics',
    label: 'Alternator Replacement',
    value: 'ALTERNATOR_REPLACEMENT',
  },
  { label: 'Starter Replacement', value: 'STARTER_REPLACEMENT' },
  { label: 'Battery Test', value: 'BATTERY_TEST' },
  { label: 'Key Programming', value: 'KEY_PROGRAMMING' },
  { label: 'Software Update', value: 'SOFTWARE_UPDATE' },
  {
    label: 'Backup Camera Repair',
    value: 'BACKUP_CAMERA_REPAIR',
    showSeparator: true,
  },
  // Recalls & Warranty
  {
    sectionHeader: 'Recalls & Warranty',
    label: 'Manufacturer Recall',
    value: 'MANUFACTURER_RECALL',
  },
  { label: 'Safety Recall', value: 'SAFETY_RECALL' },
  { label: 'Warranty Repair', value: 'WARRANTY_REPAIR' },
  { label: 'Extended Warranty Repair', value: 'EXTENDED_WARRANTY_REPAIR' },
  {
    label: 'Technical Service Bulletin Service',
    value: 'TSB_SERVICE',
    showSeparator: true,
  },
  // EV & Hybrid
  {
    sectionHeader: 'EV & Hybrid',
    label: 'EV Battery Service',
    value: 'EV_BATTERY_SERVICE',
  },
  { label: 'High Voltage System Repair', value: 'EV_HIGH_VOLTAGE_REPAIR' },
  { label: 'Charging System Repair', value: 'EV_CHARGING_SYSTEM_REPAIR' },
  {
    label: 'Hybrid Battery Replacement',
    value: 'HYBRID_BATTERY_REPLACEMENT',
    showSeparator: true,
  },
  // Convenience & Misc
  {
    sectionHeader: 'Convenience & Misc',
    label: 'Windshield Replacement',
    value: 'WINDSHIELD_REPLACEMENT',
  },
  { label: 'Wiper Replacement', value: 'WIPER_REPLACEMENT' },
  { label: 'Vehicle Detailing', value: 'DETAILING' },
  { label: 'Pre-Purchase Inspection', value: 'PRE_PURCHASE_INSPECTION' },
  { label: 'Tow-In Service Appointment', value: 'TOW_IN_SERVICE' },
  { label: 'Loaner Vehicle Request', value: 'LOANER_REQUEST' },
  { label: 'Shuttle Service Request', value: 'SHUTTLE_REQUEST' },
];

export const SUPPORTED_MAKES: CIDropdownMenuOption[] = [
  { label: 'Mercedes', value: 'mercedes' },
  { label: 'Audi', value: 'audi' },
  { label: 'Volkswagen', value: 'volkswagen' },
  { label: 'Porsche', value: 'porsche' },
  { label: 'Toyota', value: 'toyota' },
  { label: 'Lexus', value: 'lexus' },
  { label: 'Mazda', value: 'mazda' },
  { label: 'Subaru', value: 'subaru' },
  { label: 'Chevrolet', value: 'chevrolet' },
  { label: 'Buick', value: 'buick' },
  { label: 'GMC', value: 'gmc' },
  { label: 'Cadillac', value: 'cadillac' },
  { label: 'Hyundai', value: 'hyundai' },
  { label: 'Genesis', value: 'genesis' },
  { label: 'Kia', value: 'kia' },
  { label: 'Honda', value: 'honda' },
  { label: 'Acura', value: 'acura' },
  { label: 'Nissan', value: 'nissan' },
  { label: 'Mitsubishi', value: 'mitsubishi' },
  { label: 'Infiniti', value: 'infiniti' },
  { label: 'Jaguar', value: 'jaguar' },
  { label: 'Land Rover', value: 'land-rover' },
  { label: 'Ford', value: 'ford' },
  { label: 'Lincoln', value: 'lincoln' },
  { label: 'Jeep', value: 'jeep' },
  { label: 'Chrysler', value: 'chrysler' },
  { label: 'Dodge', value: 'dodge' },
  { label: 'Ram', value: 'ram' },
  { label: 'BMW', value: 'bmw' },
  { label: 'MINI', value: 'mini' },
  { label: 'Volvo', value: 'volvo' },
];

export const SLOT_DURATION: CIDropdownMenuOption[] = [
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
];

export const SLOT_CAPACITY: CIDropdownMenuOption[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
];

export const SERVICE_SCHEDULER_REDIRECT_URLS: Partial<
  Record<ServiceSchedulerPlatformType, string>
> = {
  [SERVICE_SCHEDULER_PLATFORM.TEKION]:
    'https://docs.google.com/document/d/172adgXnpRPqaEUogTVYMt_i9VT_RFmtH-IIX2SDbcgs/edit?usp=sharing',
  [SERVICE_SCHEDULER_PLATFORM.PBS]:
    'https://kommodo.ai/recordings/GMpWJvRgweaNaYh55ip9?onlyRecording=1',
  [SERVICE_SCHEDULER_PLATFORM.CDK]:
    'https://kommodo.ai/recordings/GMpWJvRgweaNaYh55ip9?onlyRecording=1',
  [SERVICE_SCHEDULER_PLATFORM.DEALERFX]:
    'https://kommodo.ai/recordings/GMpWJvRgweaNaYh55ip9?onlyRecording=1',
};
