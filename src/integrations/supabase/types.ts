export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      email_preferences: {
        Row: {
          account_emails: boolean | null
          created_at: string | null
          feature_updates: boolean | null
          marketing: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_emails?: boolean | null
          created_at?: string | null
          feature_updates?: boolean | null
          marketing?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_emails?: boolean | null
          created_at?: string | null
          feature_updates?: boolean | null
          marketing?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      "Item inventory": {
        Row: {
          Category: string | null
          Condition: string | null
          "Created At": string | null
          "Created By": string | null
          Description: string | null
          "Donor Name": string | null
          "Final Price (SEK)": string | null
          "Internal Notes": string | null
          "Item ID": number
          Location: string | null
          Name: string | null
          "Original Price (SEK)": number | null
          "Photos Count": number | null
          Quantity: number | null
          "Reserved By": string | null
          Status: string | null
          Subcategory: string | null
          "Suggested Price (SEK)": string | null
          "Updated At": string | null
          "Updated By": string | null
        }
        Insert: {
          Category?: string | null
          Condition?: string | null
          "Created At"?: string | null
          "Created By"?: string | null
          Description?: string | null
          "Donor Name"?: string | null
          "Final Price (SEK)"?: string | null
          "Internal Notes"?: string | null
          "Item ID": number
          Location?: string | null
          Name?: string | null
          "Original Price (SEK)"?: number | null
          "Photos Count"?: number | null
          Quantity?: number | null
          "Reserved By"?: string | null
          Status?: string | null
          Subcategory?: string | null
          "Suggested Price (SEK)"?: string | null
          "Updated At"?: string | null
          "Updated By"?: string | null
        }
        Update: {
          Category?: string | null
          Condition?: string | null
          "Created At"?: string | null
          "Created By"?: string | null
          Description?: string | null
          "Donor Name"?: string | null
          "Final Price (SEK)"?: string | null
          "Internal Notes"?: string | null
          "Item ID"?: number
          Location?: string | null
          Name?: string | null
          "Original Price (SEK)"?: number | null
          "Photos Count"?: number | null
          Quantity?: number | null
          "Reserved By"?: string | null
          Status?: string | null
          Subcategory?: string | null
          "Suggested Price (SEK)"?: string | null
          "Updated At"?: string | null
          "Updated By"?: string | null
        }
        Relationships: []
      }
      "Item inventory_duplicate": {
        Row: {
          Category: string | null
          Condition: string | null
          "Created At": string | null
          "Created By": string | null
          Description: string | null
          "Donor Name": string | null
          "Final Price (SEK)": string | null
          "Internal Notes": string | null
          "Item ID": number
          Location: string | null
          Name: string | null
          "Original Price (SEK)": number | null
          "Photos Count": number | null
          Quantity: number | null
          "Reserved By": string | null
          Status: string | null
          Subcategory: string | null
          "Suggested Price (SEK)": string | null
          "Updated At": string | null
          "Updated By": string | null
        }
        Insert: {
          Category?: string | null
          Condition?: string | null
          "Created At"?: string | null
          "Created By"?: string | null
          Description?: string | null
          "Donor Name"?: string | null
          "Final Price (SEK)"?: string | null
          "Internal Notes"?: string | null
          "Item ID": number
          Location?: string | null
          Name?: string | null
          "Original Price (SEK)"?: number | null
          "Photos Count"?: number | null
          Quantity?: number | null
          "Reserved By"?: string | null
          Status?: string | null
          Subcategory?: string | null
          "Suggested Price (SEK)"?: string | null
          "Updated At"?: string | null
          "Updated By"?: string | null
        }
        Update: {
          Category?: string | null
          Condition?: string | null
          "Created At"?: string | null
          "Created By"?: string | null
          Description?: string | null
          "Donor Name"?: string | null
          "Final Price (SEK)"?: string | null
          "Internal Notes"?: string | null
          "Item ID"?: number
          Location?: string | null
          Name?: string | null
          "Original Price (SEK)"?: number | null
          "Photos Count"?: number | null
          Quantity?: number | null
          "Reserved By"?: string | null
          Status?: string | null
          Subcategory?: string | null
          "Suggested Price (SEK)"?: string | null
          "Updated At"?: string | null
          "Updated By"?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string | null
          description: string | null
          height: number | null
          id: number
          is_public: boolean | null
          item_id: number | null
          metadata: Json | null
          mime_type: string | null
          size_bytes: number | null
          storage_object_id: string | null
          storage_path: string
          title: string | null
          updated_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: never
          is_public?: boolean | null
          item_id?: number | null
          metadata?: Json | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_object_id?: string | null
          storage_path: string
          title?: string | null
          updated_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: never
          is_public?: boolean | null
          item_id?: number | null
          metadata?: Json | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_object_id?: string | null
          storage_path?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "Item inventory"
            referencedColumns: ["Item ID"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email_visible: boolean | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email_visible?: boolean | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email_visible?: boolean | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "donor" | "buyer"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "donor", "buyer"],
    },
  },
} as const
