// AUTO-GENERATED — do not edit manually
// Run `bun run sync:types` to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      custom_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string
          id: string
          plant_id: string | null
          title: string
          type: Database["public"]["Enums"]["CareType"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date: string
          id?: string
          plant_id?: string | null
          title: string
          type: Database["public"]["Enums"]["CareType"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          plant_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["CareType"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_tasks_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_care_logs: {
        Row: {
          created_at: string
          done_at: string
          id: string
          plant_id: string
          type: Database["public"]["Enums"]["CareType"]
          user_id: string
        }
        Insert: {
          created_at?: string
          done_at: string
          id?: string
          plant_id: string
          type: Database["public"]["Enums"]["CareType"]
          user_id: string
        }
        Update: {
          created_at?: string
          done_at?: string
          id?: string
          plant_id?: string
          type?: Database["public"]["Enums"]["CareType"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_care_logs_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          created_at: string
          fertilize_days: number | null
          id: string
          last_fertilized_at: string | null
          last_repotted_at: string | null
          last_watered_at: string | null
          location: string
          name: string
          photo_url: string | null
          reminders_enabled: boolean
          repot_days: number | null
          updated_at: string
          user_id: string
          water_amount_ml: number | null
          watering_days: number
        }
        Insert: {
          created_at?: string
          fertilize_days?: number | null
          id?: string
          last_fertilized_at?: string | null
          last_repotted_at?: string | null
          last_watered_at?: string | null
          location: string
          name: string
          photo_url?: string | null
          reminders_enabled?: boolean
          repot_days?: number | null
          updated_at?: string
          user_id: string
          water_amount_ml?: number | null
          watering_days?: number
        }
        Update: {
          created_at?: string
          fertilize_days?: number | null
          id?: string
          last_fertilized_at?: string | null
          last_repotted_at?: string | null
          last_watered_at?: string | null
          location?: string
          name?: string
          photo_url?: string | null
          reminders_enabled?: boolean
          repot_days?: number | null
          updated_at?: string
          user_id?: string
          water_amount_ml?: number | null
          watering_days?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: string
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_care_action: {
        Args: {
          p_done_at?: string
          p_plant_id: string
          p_type: string
          p_user_id: string
        }
        Returns: Json
      }
      undo_care_action: {
        Args: {
          p_log_id: string
          p_plant_id: string
          p_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      CareType: "WATER" | "FERTILIZE" | "REPOT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CareType: ["WATER", "FERTILIZE", "REPOT"],
    },
  },
} as const
