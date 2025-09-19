
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          device_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          device_id?: string | null
        }
      }
      transfers: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string | null
          transfer_method: 'qr_code' | 'wifi_direct' | 'internet' | null
          status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress: number
          encryption_key: string | null
          qr_code_data: string | null
          created_at: string
          updated_at: string
          sender_device_id: string | null
          receiver_device_id: string | null
          application_id: string | null
        }
        Insert: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url?: string | null
          transfer_method?: 'qr_code' | 'wifi_direct' | 'internet' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          encryption_key?: string | null
          qr_code_data?: string | null
          created_at?: string
          updated_at?: string
          sender_device_id?: string | null
          receiver_device_id?: string | null
          application_id?: string | null
        }
        Update: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string | null
          transfer_method?: 'qr_code' | 'wifi_direct' | 'internet' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          encryption_key?: string | null
          qr_code_data?: string | null
          created_at?: string
          updated_at?: string
          sender_device_id?: string | null
          receiver_device_id?: string | null
          application_id?: string | null
        }
      }
      transfer_sessions: {
        Row: {
          id: string
          session_code: string
          creator_id: string | null
          is_active: boolean
          expires_at: string
          created_at: string
          creator_device_id: string | null
        }
        Insert: {
          id?: string
          session_code: string
          creator_id?: string | null
          is_active?: boolean
          expires_at?: string
          created_at?: string
          creator_device_id?: string | null
        }
        Update: {
          id?: string
          session_code?: string
          creator_id?: string | null
          is_active?: boolean
          expires_at?: string
          created_at?: string
          creator_device_id?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          transfer_id: string | null
          title: string
          message: string
          is_read: boolean
          created_at: string
          device_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          transfer_id?: string | null
          title: string
          message: string
          is_read?: boolean
          created_at?: string
          device_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          transfer_id?: string | null
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
          device_id?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          package_name: string
          app_name: string
          version_name: string | null
          version_code: number | null
          icon_url: string | null
          apk_size: number | null
          apk_url: string | null
          device_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          package_name: string
          app_name: string
          version_name?: string | null
          version_code?: number | null
          icon_url?: string | null
          apk_size?: number | null
          apk_url?: string | null
          device_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          package_name?: string
          app_name?: string
          version_name?: string | null
          version_code?: number | null
          icon_url?: string | null
          apk_size?: number | null
          apk_url?: string | null
          device_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      file_transfers: {
        Row: {
          id: string
          transfer_id: string | null
          file_data: number[] | null
          file_path: string | null
          chunk_size: number
          total_chunks: number | null
          uploaded_chunks: number
          download_url: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transfer_id?: string | null
          file_data?: number[] | null
          file_path?: string | null
          chunk_size?: number
          total_chunks?: number | null
          uploaded_chunks?: number
          download_url?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transfer_id?: string | null
          file_data?: number[] | null
          file_path?: string | null
          chunk_size?: number
          total_chunks?: number | null
          uploaded_chunks?: number
          download_url?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      transfer_chunks: {
        Row: {
          id: string
          file_transfer_id: string | null
          chunk_number: number
          chunk_data: number[]
          checksum: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_transfer_id?: string | null
          chunk_number: number
          chunk_data: number[]
          checksum?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_transfer_id?: string | null
          chunk_number?: number
          chunk_data?: number[]
          checksum?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
