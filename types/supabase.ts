
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categories": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"contact_leads": {
                  Row: {
                    "acknowledgement_sent": boolean,"activity": string | null,"admin_email_sent": boolean,"company_name": string | null,"company_role": string | null,"consent": boolean,"contact_type": string,"created_at": string,"email": string,"full_name": string,"id": string,"marketing_consent": boolean,"message": string,"phone": string | null,"policy_version": string,"retention_months": number,"siret": string | null,"source_ip": string | null,"subject": string,"user_agent": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "acknowledgement_sent"?: boolean,"activity"?: string | null,"admin_email_sent"?: boolean,"company_name"?: string | null,"company_role"?: string | null,"consent": boolean,"contact_type": string,"created_at"?: string,"email": string,"full_name": string,"id"?: string,"marketing_consent"?: boolean,"message": string,"phone"?: string | null,"policy_version": string,"retention_months": number,"siret"?: string | null,"source_ip"?: string | null,"subject": string,"user_agent"?: string | null
                  }
                  Update: {
                    "acknowledgement_sent"?: boolean,"activity"?: string | null,"admin_email_sent"?: boolean,"company_name"?: string | null,"company_role"?: string | null,"consent"?: boolean,"contact_type"?: string,"created_at"?: string,"email"?: string,"full_name"?: string,"id"?: string,"marketing_consent"?: boolean,"message"?: string,"phone"?: string | null,"policy_version"?: string,"retention_months"?: number,"siret"?: string | null,"source_ip"?: string | null,"subject"?: string,"user_agent"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"downloads": {
                  Row: {
                    "created_at": string,"download_count": number,"id": string,"last_downloaded_at": string | null,"order_item_id": string,"product_file_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"download_count"?: number,"id"?: string,"last_downloaded_at"?: string | null,"order_item_id": string,"product_file_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"download_count"?: number,"id"?: string,"last_downloaded_at"?: string | null,"order_item_id"?: string,"product_file_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "downloads_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "downloads_product_file_id_fkey"
      columns: ["product_file_id"]
isOneToOne: false
      referencedRelation: "product_files"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "id": string,"order_id": string,"product_id": string,"product_name": string,"quantity": number,"unit_price_cents": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"order_id": string,"product_id": string,"product_name": string,"quantity"?: number,"unit_price_cents": number
                  }
                  Update: {
                    "id"?: string,"order_id"?: string,"product_id"?: string,"product_name"?: string,"quantity"?: number,"unit_price_cents"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "created_at": string,"currency": string,"customer_email": string,"id": string,"last_error_message": string | null,"paid_at": string | null,"payment_method": string | null,"status": Database["public"]['Enums']["order_status"],"stripe_checkout_session_id": string | null,"stripe_customer_id": string | null,"stripe_payment_intent_id": string | null,"total_cents": number,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency"?: string,"customer_email": string,"id"?: string,"last_error_message"?: string | null,"paid_at"?: string | null,"payment_method"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"stripe_checkout_session_id"?: string | null,"stripe_customer_id"?: string | null,"stripe_payment_intent_id"?: string | null,"total_cents": number,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string,"customer_email"?: string,"id"?: string,"last_error_message"?: string | null,"paid_at"?: string | null,"payment_method"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"stripe_checkout_session_id"?: string | null,"stripe_customer_id"?: string | null,"stripe_payment_intent_id"?: string | null,"total_cents"?: number,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"payment_events": {
                  Row: {
                    "created_at": string,"details": Json | null,"event_type": string,"id": string,"order_id": string,"stripe_event_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"details"?: Json | null,"event_type": string,"id"?: string,"order_id": string,"stripe_event_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"details"?: Json | null,"event_type"?: string,"id"?: string,"order_id"?: string,"stripe_event_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_events_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"platform_admin_events": {
                  Row: {
                    "actor_user_id": string | null,"created_at": string,"details": NonNullable<Json>,"event_type": string,"id": string,"subscriber_id": string | null,"subscription_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_user_id"?: string | null,"created_at"?: string,"details"?: NonNullable<Json>,"event_type": string,"id"?: string,"subscriber_id"?: string | null,"subscription_id"?: string | null
                  }
                  Update: {
                    "actor_user_id"?: string | null,"created_at"?: string,"details"?: NonNullable<Json>,"event_type"?: string,"id"?: string,"subscriber_id"?: string | null,"subscription_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "platform_admin_events_subscriber_id_fkey"
      columns: ["subscriber_id"]
isOneToOne: false
      referencedRelation: "platform_subscribers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "platform_admin_events_subscription_id_fkey"
      columns: ["subscription_id"]
isOneToOne: false
      referencedRelation: "platform_subscriptions"
      referencedColumns: ["id"]
    }
                  ]
                },"platform_admins": {
                  Row: {
                    "created_at": string,"is_active": boolean,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"is_active"?: boolean,"role"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"is_active"?: boolean,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"platform_plans": {
                  Row: {
                    "amount_cents": number,"billing_interval": string,"created_at": string,"currency": string,"id": string,"is_active": boolean,"name": string,"notes": string,"product_code": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents"?: number,"billing_interval"?: string,"created_at"?: string,"currency"?: string,"id"?: string,"is_active"?: boolean,"name": string,"notes"?: string,"product_code": string,"updated_at"?: string
                  }
                  Update: {
                    "amount_cents"?: number,"billing_interval"?: string,"created_at"?: string,"currency"?: string,"id"?: string,"is_active"?: boolean,"name"?: string,"notes"?: string,"product_code"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "platform_plans_product_code_fkey"
      columns: ["product_code"]
isOneToOne: false
      referencedRelation: "platform_products"
      referencedColumns: ["code"]
    }
                  ]
                },"platform_product_access": {
                  Row: {
                    "access_kind": string,"created_at": string,"expires_at": string | null,"external_reference": string | null,"external_tenant_id": string | null,"id": string,"product_code": string,"secret_prefix": string | null,"status": string,"subscription_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_kind"?: string,"created_at"?: string,"expires_at"?: string | null,"external_reference"?: string | null,"external_tenant_id"?: string | null,"id"?: string,"product_code": string,"secret_prefix"?: string | null,"status"?: string,"subscription_id": string,"updated_at"?: string
                  }
                  Update: {
                    "access_kind"?: string,"created_at"?: string,"expires_at"?: string | null,"external_reference"?: string | null,"external_tenant_id"?: string | null,"id"?: string,"product_code"?: string,"secret_prefix"?: string | null,"status"?: string,"subscription_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "platform_product_access_product_code_fkey"
      columns: ["product_code"]
isOneToOne: false
      referencedRelation: "platform_products"
      referencedColumns: ["code"]
    },{
      foreignKeyName: "platform_product_access_subscription_id_fkey"
      columns: ["subscription_id"]
isOneToOne: false
      referencedRelation: "platform_subscriptions"
      referencedColumns: ["id"]
    }
                  ]
                },"platform_products": {
                  Row: {
                    "code": string,"created_at": string,"description": string,"name": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"description"?: string,"name": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"description"?: string,"name"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"platform_subscribers": {
                  Row: {
                    "company_name": string,"contact_name": string,"created_at": string,"email": string,"id": string,"notes": string,"phone": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "company_name": string,"contact_name"?: string,"created_at"?: string,"email": string,"id"?: string,"notes"?: string,"phone"?: string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "company_name"?: string,"contact_name"?: string,"created_at"?: string,"email"?: string,"id"?: string,"notes"?: string,"phone"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"platform_subscriptions": {
                  Row: {
                    "amount_cents": number,"billing_interval": string,"billing_provider": string,"cancelled_at": string | null,"created_at": string,"currency": string,"current_period_end": string | null,"id": string,"notes": string,"plan_id": string | null,"plan_name": string,"product_code": string,"starts_at": string,"status": string,"subscriber_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents"?: number,"billing_interval"?: string,"billing_provider"?: string,"cancelled_at"?: string | null,"created_at"?: string,"currency"?: string,"current_period_end"?: string | null,"id"?: string,"notes"?: string,"plan_id"?: string | null,"plan_name": string,"product_code": string,"starts_at"?: string,"status"?: string,"subscriber_id": string,"updated_at"?: string
                  }
                  Update: {
                    "amount_cents"?: number,"billing_interval"?: string,"billing_provider"?: string,"cancelled_at"?: string | null,"created_at"?: string,"currency"?: string,"current_period_end"?: string | null,"id"?: string,"notes"?: string,"plan_id"?: string | null,"plan_name"?: string,"product_code"?: string,"starts_at"?: string,"status"?: string,"subscriber_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "platform_subscriptions_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "platform_plans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "platform_subscriptions_product_code_fkey"
      columns: ["product_code"]
isOneToOne: false
      referencedRelation: "platform_products"
      referencedColumns: ["code"]
    },{
      foreignKeyName: "platform_subscriptions_subscriber_id_fkey"
      columns: ["subscriber_id"]
isOneToOne: false
      referencedRelation: "platform_subscribers"
      referencedColumns: ["id"]
    }
                  ]
                },"product_components": {
                  Row: {
                    "component_product_id": string,"product_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "component_product_id": string,"product_id": string
                  }
                  Update: {
                    "component_product_id"?: string,"product_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_components_component_product_id_fkey"
      columns: ["component_product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_components_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_files": {
                  Row: {
                    "created_at": string,"id": string,"original_name": string,"product_id": string,"storage_path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"original_name": string,"product_id": string,"storage_path": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"original_name"?: string,"product_id"?: string,"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_files_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "category_id": string | null,"created_at": string,"currency": string,"description": string,"features": NonNullable<Json>,"format": string,"id": string,"included_items": NonNullable<Json>,"is_active": boolean,"kind": Database["public"]['Enums']["product_kind"],"name": string,"preview_image_path": string | null,"price_cents": number,"seo_description": string | null,"seo_title": string | null,"short_description": string,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id"?: string | null,"created_at"?: string,"currency"?: string,"description": string,"features"?: NonNullable<Json>,"format"?: string,"id"?: string,"included_items"?: NonNullable<Json>,"is_active"?: boolean,"kind"?: Database["public"]['Enums']["product_kind"],"name": string,"preview_image_path"?: string | null,"price_cents": number,"seo_description"?: string | null,"seo_title"?: string | null,"short_description": string,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "category_id"?: string | null,"created_at"?: string,"currency"?: string,"description"?: string,"features"?: NonNullable<Json>,"format"?: string,"id"?: string,"included_items"?: NonNullable<Json>,"is_active"?: boolean,"kind"?: Database["public"]['Enums']["product_kind"],"name"?: string,"preview_image_path"?: string | null,"price_cents"?: number,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "company_name": string | null,"created_at": string,"full_name": string | null,"id": string,"phone": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "company_name"?: string | null,"created_at"?: string,"full_name"?: string | null,"id": string,"phone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "company_name"?: string | null,"created_at"?: string,"full_name"?: string | null,"id"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_platform_plan":
{ Args: { "target_amount_cents": number,"target_interval": string,"target_name": string,"target_notes"?: string,"target_product_code": string }; Returns: string
                           },
"create_platform_subscriber":
{ Args: { "target_company_name": string,"target_contact_name": string,"target_email": string,"target_notes"?: string,"target_phone"?: string }; Returns: string
                           },
"create_platform_subscription":
{ Args: { "target_amount_cents": number,"target_billing_interval": string,"target_notes"?: string,"target_period_end": string,"target_plan_name": string,"target_product_code": string,"target_starts_at": string,"target_status": string,"target_subscriber_id": string }; Returns: string
                           },
"is_platform_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"update_platform_access":
{ Args: { "target_access_id": string,"target_external_reference"?: string,"target_external_tenant_id"?: string,"target_status": string }; Returns: undefined
                           },
"update_platform_subscription_status":
{ Args: { "target_notes"?: string,"target_status": string,"target_subscription_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "order_status": "pending"|"paid"|"cancelled"|"refunded","product_kind": "single"|"pack"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "order_status": ["pending", "paid", "cancelled", "refunded"],"product_kind": ["single", "pack"]
          }
        }
} as const
