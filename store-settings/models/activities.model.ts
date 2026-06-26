export interface ActivityMeta {
  external_id: string;
  activity_type: string; // e.g., 'meeting created', 'action item'
  created_at: string; // ISO timestamp
}

export enum ActivityType {
  MEETING_CREATED = 'MEETING_CREATED',
  ACTION_ITEM = 'ACTION_ITEM',
  NEW_LEAD_FROM_FORM = 'NEW_LEAD_FROM_FORM',
}

export interface MeetingEntityData {
  _id: string;
  meeting_id: string;
  enterprise_id: string;
  team_id: string;
  lead_id: string;
  assigned_to: string | null;
  customer_id: string;
  entity_id: string | null;
  intent: string; // e.g., 'schedule_appointment'
  meeting_start_time: string; // ISO
  meeting_end_time: string; // ISO
  timezone: string;
  duration: number;
  is_active: boolean;
  status: string; // e.g., 'scheduled'
  conversation_id: string;
  service_type: string; // e.g., 'sales'
  tags: string[];
  meta?: Record<string, any>;
  proposed_vins?: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ActionItemEntityData {
  _id: string;
  intent: string; // e.g., 'ScheduleAppointment'
  enterprise_id: string;
  team_id: string;
  lead_id: string;
  assigned_to:
    | string
    | {
        user_id: string;
        user_name: string;
        email_id: string;
      };
  description: string;
  due_date: string; // ISO
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  added_by: string; // e.g., 'AI'
  is_completed: boolean;
  service_type: string; // e.g., 'sales'
  meta: {
    customer_id: string;
    vehicle_details: any | null;
    attemptsRemaining: number | null;
    callSid: string | null;
    isConversational?: boolean;
    conversationId?: string;
  };
  external_crm_action_item_id?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type ActivityEntityData =
  | MeetingEntityData
  | ActionItemEntityData
  | null;

export interface Activity {
  _id: string;
  id?: string;
  lead_id: string;
  enterprise_id: string;
  team_id: string;
  message: string;
  type: ActivityType; // e.g., 'MEETING_CREATED' | 'ACTION_ITEM' | 'NEW_LEAD_FROM_FORM'
  user_id: string; // e.g., 'AI' | 'INTERNAL'
  customer_id: string;
  meta: ActivityMeta;
  createdAt: string;
  updatedAt: string;
  __v: number;
  entity_data: ActivityEntityData;
}

export interface ActivitiesPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface FetchActivitiesParams {
  enterpriseId: string;
  teamId: string;
  customerId: string;
  activityId?: string;
  activityType?: string; // filter by activity type
  _id?: string;
  page?: number;
  limit?: number;
}

export interface ActivitiesStoreInterface {
  activities: Activity[];
  activitiesLoading: boolean;
  activitiesLoaded: boolean;
  activitiesError: boolean;
  pagination: ActivitiesPaginationMeta | null;
  selectedActivity: Activity | null;
}
