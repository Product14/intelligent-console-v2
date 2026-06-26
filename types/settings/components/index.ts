import { Appointment } from '@/app/models/appointment';

import { ReactNode } from 'react';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

export interface TeamDropdownProps {
  selectedTeam: string | null;
  onTeamChange: (team: string | null) => void;
  className?: string;
  placeholder?: string;
}

export interface MainProps {
  selectedTeam: string | null;
  setSelectedTeam: (team: string | null) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  appointments: Appointment[];
  isHomePage: boolean;
}
export interface AppointmentTimelineProps {
  appointments: Appointment[];
  startHour?: number; // e.g. 9 for 9AM
  endHour?: number; // e.g. 15 for 3PM
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isHomePage: boolean;
}

export interface HeaderRowProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  userScrollRef: React.RefObject<HTMLDivElement>;
}

export interface AppointmentGridProps {
  appointments: Appointment[];
  timeStamps: Date[];
  startHour: number;
  appointmentScrollRef: React.RefObject<HTMLDivElement>;
  isHomePage: boolean;
}
