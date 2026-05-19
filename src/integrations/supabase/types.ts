export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          categories: Json | null
          content: string
          created_at: string
          date: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          categories?: Json | null
          content: string
          created_at?: string
          date?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          categories?: Json | null
          content?: string
          created_at?: string
          date?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      cache_invalidations: {
        Row: {
          id: string
          updated_at: string
        }
        Insert: {
          id: string
          updated_at?: string
        }
        Update: {
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnostics_email_log: {
        Row: {
          failures_count: number
          id: string
          message_id: string | null
          run_date: string
          sent_at: string
        }
        Insert: {
          failures_count?: number
          id?: string
          message_id?: string | null
          run_date: string
          sent_at?: string
        }
        Update: {
          failures_count?: number
          id?: string
          message_id?: string | null
          run_date?: string
          sent_at?: string
        }
        Relationships: []
      }
      lab_test_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          product_id: string
          product_name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          product_id: string
          product_name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          product_id?: string
          product_name?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          cart_token: string | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          line_items: Json | null
          order_notes: string | null
          order_number: string | null
          order_token: string | null
          payment_method: string | null
          shipping_address: Json | null
          shipping_total: number | null
          status: string
          subtotal: number | null
          tax_total: number | null
          total: number
          updated_at: string
          woocommerce_order_id: string
        }
        Insert: {
          billing_address?: Json | null
          cart_token?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          line_items?: Json | null
          order_notes?: string | null
          order_number?: string | null
          order_token?: string | null
          payment_method?: string | null
          shipping_address?: Json | null
          shipping_total?: number | null
          status?: string
          subtotal?: number | null
          tax_total?: number | null
          total: number
          updated_at?: string
          woocommerce_order_id: string
        }
        Update: {
          billing_address?: Json | null
          cart_token?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          line_items?: Json | null
          order_notes?: string | null
          order_number?: string | null
          order_token?: string | null
          payment_method?: string | null
          shipping_address?: Json | null
          shipping_total?: number | null
          status?: string
          subtotal?: number | null
          tax_total?: number | null
          total?: number
          updated_at?: string
          woocommerce_order_id?: string
        }
        Relationships: []
      }
      products_cache: {
        Row: {
          created_at: string
          data: Json
          image_map: Json
          slug: string
          synced_at: string
          woocommerce_id: number
        }
        Insert: {
          created_at?: string
          data: Json
          image_map?: Json
          slug: string
          synced_at?: string
          woocommerce_id: number
        }
        Update: {
          created_at?: string
          data?: Json
          image_map?: Json
          slug?: string
          synced_at?: string
          woocommerce_id?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
