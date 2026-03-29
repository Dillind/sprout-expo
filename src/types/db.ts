export type { Tables, TablesInsert, TablesUpdate, Enums, Database } from '@/backend-sdk/schema';

/** Shorthand for a plant row */
export type Plant = import('@/backend-sdk/schema').Tables<'plants'>;

/** Shorthand for a care log row */
export type PlantCareLog = import('@/backend-sdk/schema').Tables<'plant_care_logs'>;

/** Shorthand for a custom task row */
export type CustomTask = import('@/backend-sdk/schema').Tables<'custom_tasks'>;

/** Shorthand for the care type enum */
export type CareType = import('@/backend-sdk/schema').Enums<'CareType'>;
