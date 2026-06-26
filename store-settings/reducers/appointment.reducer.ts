import { aggregateAppointmentsForDate } from '@/app/helpers/appointment.helper';
import {
  Appointment,
  AppointmentPaginationResponse,
  AppointmentResponse,
} from '@/app-models-settings/appointment';
import {
  AppointmentActionTypes,
  FetchAppointmentDetailsErrorPayload,
  FetchAppointmentDetailsRequestPayload,
  FetchAppointmentDetailsSuccessPayload,
  FetchAppointmentsRequestPayload,
  UpdateAppointmentErrorPayload,
  UpdateAppointmentRequestPayload,
  UpdateAppointmentSuccessPayload,
} from '@/store-settings/actions/appointment.actions';
import { AppointmentStoreInterface } from '@/store-settings/models/appointment/appointment.model';

const patchFullDetailAppointment = (
  appointments: Appointment[],
  appointmentId: string,
  payload?: any,
  fullDetails?: any,
  loading = false,
  loaded = false,
  error = false
) => {
  const updatedAppointments = Object.values(appointments).map((appointment) =>
    appointment.id === appointmentId
      ? {
          ...payload,
          ...appointment,
          fullDetails,
          fullDetailsLoading: loading,
          fullDetailsLoaded: loaded,
          fullDetailsError: error,
        }
      : appointment
  );

  return updatedAppointments;
};
export interface FetchAppointmentsPayload {
  appointments?: Record<string, Appointment[]>;
  rawMeetings?: AppointmentResponse[]; // Add raw meetings data
  paginationState?: AppointmentPaginationResponse;
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
  totalCount?: number;
  currentPage?: number;
}

const initialState: AppointmentStoreInterface = {
  appointments: {},
  rawMeetings: [], // Initialize raw meetings array
  appointmentsLoading: false,
  appointmentsLoaded: false,
  appointmentsError: false,
  patchAppointmentLoading: false,
  patchAppointmentSuccess: false,
  patchAppointmentError: false,
  patchAppointmentErrorMessage: null,
  paginationState: {
    hasNextPage: false,
    hasPreviousPage: false,
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  },
};

const appointmentReducer = (
  state = initialState,
  action: {
    type: AppointmentActionTypes;
    payload:
      | FetchAppointmentsPayload
      | UpdateAppointmentRequestPayload
      | FetchAppointmentsRequestPayload
      | UpdateAppointmentSuccessPayload
      | UpdateAppointmentErrorPayload
      | FetchAppointmentDetailsRequestPayload
      | FetchAppointmentDetailsSuccessPayload
      | FetchAppointmentDetailsErrorPayload;
  }
) => {
  switch (action.type) {
    case AppointmentActionTypes.LOAD_APPOINTMENTS: {
      const payload = action.payload as FetchAppointmentsPayload;
      return {
        ...state,
        appointments: payload.appointments ?? state.appointments,
        rawMeetings: payload.rawMeetings ?? state.rawMeetings, // Update raw meetings
        appointmentsLoading: payload.loading ?? state.appointmentsLoading,
        appointmentsLoaded: payload.loaded ?? state.appointmentsLoaded,
        appointmentsError: payload.error ?? state.appointmentsError,
        paginationState: payload.paginationState ?? state.paginationState,
      };
    }

    case AppointmentActionTypes.UPDATE_APPOINTMENT_REQUEST: {
      return {
        ...state,
        patchAppointmentLoading: true,
        patchAppointmentSuccess: false,
        patchAppointmentError: false,
        patchAppointmentErrorMessage: null,
      };
    }

    case AppointmentActionTypes.UPDATE_APPOINTMENT_SUCCESS: {
      const payload = action.payload as UpdateAppointmentSuccessPayload;
      const updatedAppointments = Object.values(state.appointments)
        .flat(1)
        .map((appointment) =>
          appointment.id === payload.appointmentId
            ? payload.updatedAppointment
            : appointment
        );

      return {
        ...state,
        appointments: aggregateAppointmentsForDate(updatedAppointments),
        patchAppointmentLoading: false,
        patchAppointmentSuccess: true,
        patchAppointmentError: false,
        patchAppointmentErrorMessage: null,
      };
    }

    case AppointmentActionTypes.UPDATE_APPOINTMENT_ERROR: {
      const payload = action.payload as UpdateAppointmentErrorPayload;
      return {
        ...state,
        patchAppointmentLoading: false,
        patchAppointmentSuccess: false,
        patchAppointmentError: true,
        patchAppointmentErrorMessage: payload.error,
      };
    }

    // New cases for appointment details
    case AppointmentActionTypes.FETCH_APPOINTMENT_DETAILS_REQUEST: {
      const { appointmentId } =
        action.payload as FetchAppointmentDetailsRequestPayload;
      const updatedStateForAppointment = patchFullDetailAppointment(
        Object.values(state.appointments).flat(1),
        appointmentId,
        null,
        undefined,
        true
      );
      return {
        ...state,
        appointments: aggregateAppointmentsForDate(updatedStateForAppointment),
      };
    }

    case AppointmentActionTypes.FETCH_APPOINTMENT_DETAILS_SUCCESS: {
      const { appointmentId, appointmentDetails } =
        action.payload as FetchAppointmentDetailsSuccessPayload;
      const updatedStateForAppointment = patchFullDetailAppointment(
        Object.values(state.appointments).flat(1),
        appointmentId,
        appointmentDetails,
        false,
        true,
        false
      );
      return {
        ...state,
        appointments: aggregateAppointmentsForDate(updatedStateForAppointment),
      };
    }

    case AppointmentActionTypes.FETCH_APPOINTMENT_DETAILS_ERROR: {
      const { appointmentId } =
        action.payload as FetchAppointmentDetailsErrorPayload;
      const updatedStateForAppointment = patchFullDetailAppointment(
        Object.values(state.appointments).flat(1),
        appointmentId,
        null,
        undefined,
        false,
        false,
        true
      );
      return {
        ...state,
        appointments: aggregateAppointmentsForDate(updatedStateForAppointment),
      };
    }

    default:
      return state;
  }
};

export default appointmentReducer;
