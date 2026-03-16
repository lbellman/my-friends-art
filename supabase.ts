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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      address: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: string
          line1: string
          line2: string | null
          name: string
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          id?: string
          line1: string
          line2?: string | null
          name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          line1?: string
          line2?: string | null
          name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      art_piece: {
        Row: {
          artist_id: string | null
          aspect_ratio: Database["public"]["Enums"]["aspect_ratios"]
          created_at: string | null
          description: string | null
          display_path: string | null
          dpi: number | null
          id: string
          medium: Database["public"]["Enums"]["art_mediums"]
          original_path: string | null
          product_type: Database["public"]["Enums"]["product_types"] | null
          px_height: number | null
          px_width: number | null
          status: Database["public"]["Enums"]["art_piece_statuses"] | null
          thumbnail_path: string | null
          title: string
        }
        Insert: {
          artist_id?: string | null
          aspect_ratio: Database["public"]["Enums"]["aspect_ratios"]
          created_at?: string | null
          description?: string | null
          display_path?: string | null
          dpi?: number | null
          id?: string
          medium: Database["public"]["Enums"]["art_mediums"]
          original_path?: string | null
          product_type?: Database["public"]["Enums"]["product_types"] | null
          px_height?: number | null
          px_width?: number | null
          status?: Database["public"]["Enums"]["art_piece_statuses"] | null
          thumbnail_path?: string | null
          title: string
        }
        Update: {
          artist_id?: string | null
          aspect_ratio?: Database["public"]["Enums"]["aspect_ratios"]
          created_at?: string | null
          description?: string | null
          display_path?: string | null
          dpi?: number | null
          id?: string
          medium?: Database["public"]["Enums"]["art_mediums"]
          original_path?: string | null
          product_type?: Database["public"]["Enums"]["product_types"] | null
          px_height?: number | null
          px_width?: number | null
          status?: Database["public"]["Enums"]["art_piece_statuses"] | null
          thumbnail_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_piece_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
        ]
      }
      artist: {
        Row: {
          bio: string | null
          created_at: string | null
          email_address: string | null
          facebook: string | null
          id: string
          instagram: string | null
          location: string | null
          name: string
          profile_img_url: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email_address?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          name: string
          profile_img_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email_address?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          name?: string
          profile_img_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      dimensions: {
        Row: {
          aspect_ratio: Database["public"]["Enums"]["aspect_ratios"]
          height: number
          id: string
          width: number
        }
        Insert: {
          aspect_ratio: Database["public"]["Enums"]["aspect_ratios"]
          height: number
          id?: string
          width: number
        }
        Update: {
          aspect_ratio?: Database["public"]["Enums"]["aspect_ratios"]
          height?: number
          id?: string
          width?: number
        }
        Relationships: []
      }
      payment_intent: {
        Row: {
          created_at: string | null
          id: string
          stripe_payment_intent_id: string
          stripe_payment_intent_status: Database["public"]["Enums"]["payment_intent_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stripe_payment_intent_id: string
          stripe_payment_intent_status?: Database["public"]["Enums"]["payment_intent_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stripe_payment_intent_id?: string
          stripe_payment_intent_status?: Database["public"]["Enums"]["payment_intent_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      purchase_item: {
        Row: {
          art_piece_id: string
          created_at: string | null
          height: number
          id: string
          price: number
          print_option: Database["public"]["Enums"]["print_options"]
          purchase_order_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string
          width: number
        }
        Insert: {
          art_piece_id: string
          created_at?: string | null
          height: number
          id?: string
          price: number
          print_option: Database["public"]["Enums"]["print_options"]
          purchase_order_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id: string
          width: number
        }
        Update: {
          art_piece_id?: string
          created_at?: string | null
          height?: number
          id?: string
          price?: number
          print_option?: Database["public"]["Enums"]["print_options"]
          purchase_order_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_item_art_piece_id_fkey"
            columns: ["art_piece_id"]
            isOneToOne: false
            referencedRelation: "art_piece"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_item_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order: {
        Row: {
          billing_address_id: string | null
          created_at: string | null
          id: string
          order_notification_sent_at: string | null
          payment_intent_id: string
          shipping_address_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string | null
          id?: string
          order_notification_sent_at?: string | null
          payment_intent_id: string
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string | null
          id?: string
          order_notification_sent_at?: string | null
          payment_intent_id?: string
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_payment_intent_id_fkey"
            columns: ["payment_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_price: {
        Args: {
          p_height: number
          p_print_type: Database["public"]["Enums"]["print_options"]
          p_width: number
        }
        Returns: number
      }
      get_dimension_options: {
        Args: {
          aspect_ratio: Database["public"]["Enums"]["aspect_ratios"]
          dpi: number
          px_height: number
          px_width: number
        }
        Returns: {
          height: number
          width: number
        }[]
      }
      rpc_search_art_pieces: {
        Args: { query: string }
        Returns: {
          art_piece_id: string
          artist_id: string
          artist_name: string
          aspect_ratio: Database["public"]["Enums"]["aspect_ratios"]
          display_path: string
          dpi: number
          medium: string
          px_height: number
          px_width: number
          thumbnail_path: string
          title: string
        }[]
      }
      rpc_search_artists: {
        Args: { query: string }
        Returns: {
          bio: string | null
          created_at: string | null
          email_address: string | null
          facebook: string | null
          id: string
          instagram: string | null
          location: string | null
          name: string
          profile_img_url: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "artist"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      art_mediums:
        | "oil"
        | "acrylic"
        | "watercolor"
        | "pastel"
        | "pencil"
        | "digital"
        | "mixed-media"
        | "needle-felt"
        | "crochet"
        | "knit"
        | "pen"
        | "wood"
        | "clay"
        | "paper-machet"
        | "pottery"
        | "other"
      art_piece_statuses: "pending-approval" | "approved"
      aspect_ratios: "1:1" | "2:3" | "3:4"
      order_status: "pending" | "succeeded"
      payment_intent_status:
        | "Blocked"
        | "Canceled"
        | "Dispute lost"
        | "Dispute needs response"
        | "Dispute under review"
        | "Dispute won"
        | "Early fraud warning"
        | "Expired"
        | "Failed"
        | "Incomplete"
        | "Inquiry closed"
        | "Inquiry needs response"
        | "Inquiry under review"
        | "Partially refunded"
        | "Pending"
        | "Refund pending"
        | "Refunded"
        | "Succeeded"
        | "Uncaptured"
      print_options: "canvas" | "framed-canvas" | "poster" | "framed-poster"
      product_types: "print" | "original" | "print-and-original"
      quality_ratings: "fair" | "good" | "best"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      art_mediums: [
        "oil",
        "acrylic",
        "watercolor",
        "pastel",
        "pencil",
        "digital",
        "mixed-media",
        "needle-felt",
        "crochet",
        "knit",
        "pen",
        "wood",
        "clay",
        "paper-machet",
        "pottery",
        "other",
      ],
      art_piece_statuses: ["pending-approval", "approved"],
      aspect_ratios: ["1:1", "2:3", "3:4"],
      order_status: ["pending", "succeeded"],
      payment_intent_status: [
        "Blocked",
        "Canceled",
        "Dispute lost",
        "Dispute needs response",
        "Dispute under review",
        "Dispute won",
        "Early fraud warning",
        "Expired",
        "Failed",
        "Incomplete",
        "Inquiry closed",
        "Inquiry needs response",
        "Inquiry under review",
        "Partially refunded",
        "Pending",
        "Refund pending",
        "Refunded",
        "Succeeded",
        "Uncaptured",
      ],
      print_options: ["canvas", "framed-canvas", "poster", "framed-poster"],
      product_types: ["print", "original", "print-and-original"],
      quality_ratings: ["fair", "good", "best"],
    },
  },
} as const
