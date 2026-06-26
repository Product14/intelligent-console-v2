import { DropdownOption } from '@spyne-console/design-system/dropdown';

export interface TeamRepresentative {
  user_id: string;
  user_name: string;
  email_id: string;
  contact_no: string;
  department: string | null;
  senority: string | null;
  team_id: string;
  timezone: string;
  availability: {
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  };
  // role: string; // Replace this with role enum
  // group: RepresentativeGroupType;
}

export enum SeniorityLevel {
  LEVEL_1 = 'Level 1',
  LEVEL_2 = 'Level 2',
  LEVEL_3 = 'Level 3',
  LEVEL_4 = 'Level 4',
  LEVEL_5 = 'Level 5',
}
export enum Department {
  SALES = 'Sales',
  SERVICE = 'Service',
  FINANCE = 'Finance',
  MARKETING = 'Marketing',
  TRADE_IN = 'Trade-In',
  PARTS = 'Parts',
}

export enum Role {
  ADMIN = 'Admin',
  REP = 'Rep',
  MANAGER = 'Manager',
  LEAD = 'Lead',
  USER = 'User',
}

export const regionOptions = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', id: 'Asia/Kolkata' },
  {
    value: 'America/Los_Angeles',
    label: 'America/LA (PT)',
    id: 'America/Los_Angeles',
  },
  {
    value: 'America/Denver',
    label: 'America/Denver (MT)',
    id: 'America/Denver',
  },
  {
    value: 'America/Chicago',
    label: 'America/Chicago (CT)',
    id: 'America/Chicago',
  },
  {
    value: 'America/New_York',
    label: 'America/NY (ET)',
    id: 'America/New_York',
  },
  { value: 'Etc/GMT', label: 'London (GMT)', id: 'Etc/GMT' },
];

export const roleOptions: DropdownOption[] = Object.values(Role).map(
  (role) => ({
    key: role,
    id: role,
    text: role.toString(),
    label: role.toString(),
    value: role,
  })
);
export const seniorityOptions: DropdownOption[] = Object.values(
  SeniorityLevel
).map((level) => ({
  key: level,
  id: level,
  text: level.toString(),
  label: level.toString(),
  value: level,
}));

export const departmentOptions: DropdownOption[] = Object.values(
  Department
).map((department) => ({
  key: department,
  id: department,
  text: department.toString(),
  label: department.toString(),
  value: department,
}));

export enum RepresentativeGroupType {
  FINANCE = 'Finance',
  SALES = 'Sales',
}
