import {
  Appointment,
  AppointmentPaginationResponse,
  AppointmentResponse,
} from '@/app-models-settings/appointment';

export interface AppointmentStoreInterface {
  appointments: Record<string, Appointment[]>;
  rawMeetings: AppointmentResponse[]; // Store raw meeting data for the new table
  appointmentsLoading: boolean;
  appointmentsLoaded: boolean;
  appointmentsError: boolean;
  patchAppointmentLoading: boolean;
  patchAppointmentSuccess: boolean;
  patchAppointmentError: boolean;
  patchAppointmentErrorMessage: string | null;
  paginationState: AppointmentPaginationResponse;
}
