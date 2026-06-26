import { Appointment, AppointmentStatus } from '@/app-models-settings/appointment';
import { createAction } from '@reduxjs/toolkit';

import { FetchAppointmentsPayload } from '../reducers/appointment.reducer';

export interface FetchAppointmentsRequestPayload {
  enterpriseId: string;
  teamId: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  serviceType?: string;
  customerId?: string;
  buyingIntent?: string[] | string;
  customerStatus?: string[] | string;
  assignedTo?: string;
  leadId?: string;
  intent?: string;
  tradeInRequested?: string;
  loanerVehicleRequested?: string;
  pickupPreference?: string;
  urgencyLevel?: string;
  whichServiceType?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
}

export interface UpdateAppointmentRequestPayload {
  appointmentId: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentSuccessPayload {
  appointmentId: string;
  updatedAppointment: Appointment;
  loading: boolean;
  success: boolean;
  error: boolean;
}

export interface UpdateAppointmentErrorPayload {
  appointmentId: string;
  error: string;
  loading: boolean;
  success: boolean;
}

export interface FetchAppointmentDetailsRequestPayload {
  appointmentId: string;
}

export interface FetchAppointmentDetailsSuccessPayload {
  appointmentId: string;
  appointmentDetails: Appointment;
  loading: boolean;
  loaded: boolean;
  error: boolean;
}

export interface FetchAppointmentDetailsErrorPayload {
  appointmentId: string;
  error: string;
  loading: boolean;
  loaded: boolean;
}

export enum AppointmentActionTypes {
  FETCH_APPOINTMENTS = 'appointment/fetchAppointments',
  LOAD_APPOINTMENTS = 'appointment/patchAppointments',
  UPDATE_APPOINTMENT_REQUEST = 'appointment/updateAppointmentRequest',
  UPDATE_APPOINTMENT_SUCCESS = 'appointment/updateAppointmentSuccess',
  UPDATE_APPOINTMENT_ERROR = 'appointment/updateAppointmentError',
  FETCH_APPOINTMENT_DETAILS_REQUEST = 'appointment/fetchAppointmentDetailsRequest',
  FETCH_APPOINTMENT_DETAILS_SUCCESS = 'appointment/fetchAppointmentDetailsSuccess',
  FETCH_APPOINTMENT_DETAILS_ERROR = 'appointment/fetchAppointmentDetailsError',
}

export const fetchAppointments = createAction(
  AppointmentActionTypes.FETCH_APPOINTMENTS,
  (payload: FetchAppointmentsRequestPayload) => ({
    payload,
  })
);

export const loadAppointments = createAction(
  AppointmentActionTypes.LOAD_APPOINTMENTS,
  (payload: FetchAppointmentsPayload) => ({
    payload,
  })
);

export const updateAppointmentRequest = createAction(
  AppointmentActionTypes.UPDATE_APPOINTMENT_REQUEST,
  (payload: UpdateAppointmentRequestPayload) => ({
    payload,
  })
);

export const updateAppointmentSuccess = createAction(
  AppointmentActionTypes.UPDATE_APPOINTMENT_SUCCESS,
  (payload: UpdateAppointmentSuccessPayload) => ({
    payload,
  })
);

export const updateAppointmentError = createAction(
  AppointmentActionTypes.UPDATE_APPOINTMENT_ERROR,
  (payload: UpdateAppointmentErrorPayload) => ({
    payload,
  })
);

export const fetchAppointmentDetailsRequest = createAction(
  AppointmentActionTypes.FETCH_APPOINTMENT_DETAILS_REQUEST,
  (payload: FetchAppointmentDetailsRequestPayload) => ({
    payload,
  })
);

export const fetchAppointmentDetailsSuccess = createAction(
  AppointmentActionTypes.FETCH_APPOINTMENT_DETAILS_SUCCESS,
  (payload: FetchAppointmentDetailsSuccessPayload) => ({
    payload,
  })
);

export const fetchAppointmentDetailsError = createAction(
  AppointmentActionTypes.FETCH_APPOINTMENT_DETAILS_ERROR,
  (payload: FetchAppointmentDetailsErrorPayload) => ({
    payload,
  })
);
