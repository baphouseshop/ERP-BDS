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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          agreed_price: number | null
          booking_amount: number
          booking_date: string
          booking_number: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          expiry_date: string | null
          f2_agency_id: string | null
          id: string
          notes: string | null
          sales_id: string
          status: Database["public"]["Enums"]["booking_status"]
          transfer_date: string | null
          transferred_to_developer: boolean | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          agreed_price?: number | null
          booking_amount: number
          booking_date: string
          booking_number: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          expiry_date?: string | null
          f2_agency_id?: string | null
          id?: string
          notes?: string | null
          sales_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          transfer_date?: string | null
          transferred_to_developer?: boolean | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          agreed_price?: number | null
          booking_amount?: number
          booking_date?: string
          booking_number?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          expiry_date?: string | null
          f2_agency_id?: string | null
          id?: string
          notes?: string | null
          sales_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          transfer_date?: string | null
          transferred_to_developer?: boolean | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_f2_agency_id_fkey"
            columns: ["f2_agency_id"]
            isOneToOne: false
            referencedRelation: "f2_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellations: {
        Row: {
          approved_by: string | null
          attached_documents: Json | null
          booking_id: string | null
          cancellation_date: string
          cancellation_number: string
          cancellation_type: Database["public"]["Enums"]["cancellation_type"]
          commission_reversed: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          developer_compensation: number | null
          id: string
          internal_commission_clawback: number | null
          notes: string | null
          penalty_charged: number | null
          reason: string
          refund_from_developer: number | null
          refund_to_customer: number | null
          sale_contract_id: string | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          attached_documents?: Json | null
          booking_id?: string | null
          cancellation_date: string
          cancellation_number: string
          cancellation_type: Database["public"]["Enums"]["cancellation_type"]
          commission_reversed?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          developer_compensation?: number | null
          id?: string
          internal_commission_clawback?: number | null
          notes?: string | null
          penalty_charged?: number | null
          reason: string
          refund_from_developer?: number | null
          refund_to_customer?: number | null
          sale_contract_id?: string | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          attached_documents?: Json | null
          booking_id?: string | null
          cancellation_date?: string
          cancellation_number?: string
          cancellation_type?: Database["public"]["Enums"]["cancellation_type"]
          commission_reversed?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          developer_compensation?: number | null
          id?: string
          internal_commission_clawback?: number | null
          notes?: string | null
          penalty_charged?: number | null
          reason?: string
          refund_from_developer?: number | null
          refund_to_customer?: number | null
          sale_contract_id?: string | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_sale_contract_id_fkey"
            columns: ["sale_contract_id"]
            isOneToOne: false
            referencedRelation: "sale_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_records: {
        Row: {
          base_amount: number
          commission_amount: number
          commission_rate: number
          created_at: string | null
          created_by: string | null
          developer_id: string
          distribution_contract_id: string
          id: string
          invoice_date: string | null
          invoice_file_url: string | null
          invoice_number: string | null
          notes: string | null
          project_id: string
          received_amount: number | null
          received_date: string | null
          recognition_date: string | null
          record_number: string
          reversed_at: string | null
          reversed_reason: string | null
          sale_contract_id: string
          status: Database["public"]["Enums"]["commission_status"]
          total_invoice_amount: number
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          base_amount: number
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          created_by?: string | null
          developer_id: string
          distribution_contract_id: string
          id?: string
          invoice_date?: string | null
          invoice_file_url?: string | null
          invoice_number?: string | null
          notes?: string | null
          project_id: string
          received_amount?: number | null
          received_date?: string | null
          recognition_date?: string | null
          record_number: string
          reversed_at?: string | null
          reversed_reason?: string | null
          sale_contract_id: string
          status?: Database["public"]["Enums"]["commission_status"]
          total_invoice_amount: number
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          base_amount?: number
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          created_by?: string | null
          developer_id?: string
          distribution_contract_id?: string
          id?: string
          invoice_date?: string | null
          invoice_file_url?: string | null
          invoice_number?: string | null
          notes?: string | null
          project_id?: string
          received_amount?: number | null
          received_date?: string | null
          recognition_date?: string | null
          record_number?: string
          reversed_at?: string | null
          reversed_reason?: string | null
          sale_contract_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
          total_invoice_amount?: number
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_records_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_distribution_contract_id_fkey"
            columns: ["distribution_contract_id"]
            isOneToOne: false
            referencedRelation: "distribution_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_revenue_overview"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "commission_records_sale_contract_id_fkey"
            columns: ["sale_contract_id"]
            isOneToOne: false
            referencedRelation: "sale_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_split_policies: {
        Row: {
          company_retain_rate: number
          created_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          policy_code: string
          policy_name: string
          project_id: string | null
          sales_manager_rate: number
          sales_rate: number
          team_leader_rate: number
        }
        Insert: {
          company_retain_rate?: number
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          policy_code: string
          policy_name: string
          project_id?: string | null
          sales_manager_rate?: number
          sales_rate?: number
          team_leader_rate?: number
        }
        Update: {
          company_retain_rate?: number
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          policy_code?: string
          policy_name?: string
          project_id?: string | null
          sales_manager_rate?: number
          sales_rate?: number
          team_leader_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "commission_split_policies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_split_policies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_revenue_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          assigned_sales_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          id_issued_date: string | null
          id_issued_place: string | null
          id_number: string | null
          is_active: boolean | null
          notes: string | null
          permanent_address: string | null
          phone: string | null
          source: string | null
          source_detail: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          assigned_sales_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_issued_date?: string | null
          id_issued_place?: string | null
          id_number?: string | null
          is_active?: boolean | null
          notes?: string | null
          permanent_address?: string | null
          phone?: string | null
          source?: string | null
          source_detail?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          assigned_sales_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_issued_date?: string | null
          id_issued_place?: string | null
          id_number?: string | null
          is_active?: boolean | null
          notes?: string | null
          permanent_address?: string | null
          phone?: string | null
          source?: string | null
          source_detail?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_sales_id_fkey"
            columns: ["assigned_sales_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          code: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          tax_code: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          code: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          tax_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          code?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          tax_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      distribution_contracts: {
        Row: {
          agency_tier: Database["public"]["Enums"]["agency_tier"] | null
          commission_rate: number
          contract_file_url: string | null
          contract_number: string
          created_at: string | null
          created_by: string | null
          deposit_amount: number | null
          developer_id: string
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          kpi_units_per_month: number | null
          notes: string | null
          parent_f1_agency_id: string | null
          payment_trigger: string | null
          payment_trigger_percentage: number | null
          penalty_terms: string | null
          project_id: string
          signed_date: string
          units_assigned: number | null
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          agency_tier?: Database["public"]["Enums"]["agency_tier"] | null
          commission_rate: number
          contract_file_url?: string | null
          contract_number: string
          created_at?: string | null
          created_by?: string | null
          deposit_amount?: number | null
          developer_id: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          kpi_units_per_month?: number | null
          notes?: string | null
          parent_f1_agency_id?: string | null
          payment_trigger?: string | null
          payment_trigger_percentage?: number | null
          penalty_terms?: string | null
          project_id: string
          signed_date: string
          units_assigned?: number | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          agency_tier?: Database["public"]["Enums"]["agency_tier"] | null
          commission_rate?: number
          contract_file_url?: string | null
          contract_number?: string
          created_at?: string | null
          created_by?: string | null
          deposit_amount?: number | null
          developer_id?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          kpi_units_per_month?: number | null
          notes?: string | null
          parent_f1_agency_id?: string | null
          payment_trigger?: string | null
          payment_trigger_percentage?: number | null
          penalty_terms?: string | null
          project_id?: string
          signed_date?: string
          units_assigned?: number | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_contracts_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_contracts_parent_f1_agency_id_fkey"
            columns: ["parent_f1_agency_id"]
            isOneToOne: false
            referencedRelation: "f2_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_revenue_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          base_commission_rate: number | null
          code: string
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          has_labor_contract: boolean | null
          hire_date: string | null
          id: string
          id_number: string | null
          is_active: boolean | null
          manager_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["employee_role"]
          tax_code: string | null
          team_leader_id: string | null
          termination_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_name?: string | null
          base_commission_rate?: number | null
          code: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name: string
          has_labor_contract?: boolean | null
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          manager_id?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["employee_role"]
          tax_code?: string | null
          team_leader_id?: string | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_name?: string | null
          base_commission_rate?: number | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          has_labor_contract?: boolean | null
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          manager_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          tax_code?: string | null
          team_leader_id?: string | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          attached_files: Json | null
          category: Database["public"]["Enums"]["cost_category"]
          created_at: string | null
          created_by: string | null
          description: string
          employee_id: string | null
          expense_date: string
          expense_number: string
          id: string
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_status: string | null
          period_type: Database["public"]["Enums"]["cost_period_type"] | null
          project_id: string | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
          vendor_name: string | null
          vendor_tax_code: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          attached_files?: Json | null
          category: Database["public"]["Enums"]["cost_category"]
          created_at?: string | null
          created_by?: string | null
          description: string
          employee_id?: string | null
          expense_date: string
          expense_number: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          period_type?: Database["public"]["Enums"]["cost_period_type"] | null
          project_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vendor_name?: string | null
          vendor_tax_code?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          attached_files?: Json | null
          category?: Database["public"]["Enums"]["cost_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string
          employee_id?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          period_type?: Database["public"]["Enums"]["cost_period_type"] | null
          project_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vendor_name?: string | null
          vendor_tax_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_revenue_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      f2_agencies: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          code: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          default_commission_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          tax_code: string | null
          tier: Database["public"]["Enums"]["agency_tier"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          code: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          default_commission_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          tax_code?: string | null
          tier?: Database["public"]["Enums"]["agency_tier"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          code?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          default_commission_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          tax_code?: string | null
          tier?: Database["public"]["Enums"]["agency_tier"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_commissions: {
        Row: {
          amount_before_tax: number
          approved_at: string | null
          approved_by: string | null
          base_commission_amount: number
          clawed_back_at: string | null
          clawed_back_reason: string | null
          commission_record_id: string
          created_at: string | null
          id: string
          net_amount: number
          notes: string | null
          paid_at: string | null
          payment_reference: string | null
          pit_amount: number | null
          pit_rate: number | null
          rate: number
          recipient_employee_id: string | null
          recipient_f2_id: string | null
          recipient_type: string
          sale_contract_id: string
          status: Database["public"]["Enums"]["internal_commission_status"]
          updated_at: string | null
        }
        Insert: {
          amount_before_tax: number
          approved_at?: string | null
          approved_by?: string | null
          base_commission_amount: number
          clawed_back_at?: string | null
          clawed_back_reason?: string | null
          commission_record_id: string
          created_at?: string | null
          id?: string
          net_amount: number
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          pit_amount?: number | null
          pit_rate?: number | null
          rate: number
          recipient_employee_id?: string | null
          recipient_f2_id?: string | null
          recipient_type: string
          sale_contract_id: string
          status?: Database["public"]["Enums"]["internal_commission_status"]
          updated_at?: string | null
        }
        Update: {
          amount_before_tax?: number
          approved_at?: string | null
          approved_by?: string | null
          base_commission_amount?: number
          clawed_back_at?: string | null
          clawed_back_reason?: string | null
          commission_record_id?: string
          created_at?: string | null
          id?: string
          net_amount?: number
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          pit_amount?: number | null
          pit_rate?: number | null
          rate?: number
          recipient_employee_id?: string | null
          recipient_f2_id?: string | null
          recipient_type?: string
          sale_contract_id?: string
          status?: Database["public"]["Enums"]["internal_commission_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_commissions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_commissions_commission_record_id_fkey"
            columns: ["commission_record_id"]
            isOneToOne: false
            referencedRelation: "commission_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_commissions_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_commissions_recipient_f2_id_fkey"
            columns: ["recipient_f2_id"]
            isOneToOne: false
            referencedRelation: "f2_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_commissions_sale_contract_id_fkey"
            columns: ["sale_contract_id"]
            isOneToOne: false
            referencedRelation: "sale_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_snapshots: {
        Row: {
          commission_earned: number | null
          created_at: string | null
          employee_id: string | null
          id: string
          month: number | null
          rank: string | null
          total_revenue: number | null
          total_sales: number | null
          year: number | null
        }
        Insert: {
          commission_earned?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          month?: number | null
          rank?: string | null
          total_revenue?: number | null
          total_sales?: number | null
          year?: number | null
        }
        Update: {
          commission_earned?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          month?: number | null
          rank?: string | null
          total_revenue?: number | null
          total_sales?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_snapshots_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          priority: number | null
          recipient_id: string | null
          related_record_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: number | null
          recipient_id?: string | null
          related_record_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: number | null
          recipient_id?: string | null
          related_record_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          percentage: number
          sale_contract_id: string
          status: Database["public"]["Enums"]["payment_schedule_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          percentage: number
          sale_contract_id: string
          status?: Database["public"]["Enums"]["payment_schedule_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          percentage?: number
          sale_contract_id?: string
          status?: Database["public"]["Enums"]["payment_schedule_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_sale_contract_id_fkey"
            columns: ["sale_contract_id"]
            isOneToOne: false
            referencedRelation: "sale_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency: string | null
          created_at: string
          employee_code: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          agency?: string | null
          created_at?: string
          employee_code?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          agency?: string | null
          created_at?: string
          employee_code?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          created_by: string | null
          default_commission_rate: number
          description: string | null
          developer_id: string
          district: string | null
          expected_handover_date: string | null
          id: string
          is_active: boolean | null
          legal_documents: string | null
          legal_status: string | null
          name: string
          project_type: string | null
          province: string | null
          start_date: string | null
          total_units: number | null
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          default_commission_rate?: number
          description?: string | null
          developer_id: string
          district?: string | null
          expected_handover_date?: string | null
          id?: string
          is_active?: boolean | null
          legal_documents?: string | null
          legal_status?: string | null
          name: string
          project_type?: string | null
          province?: string | null
          start_date?: string | null
          total_units?: number | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          default_commission_rate?: number
          description?: string | null
          developer_id?: string
          district?: string | null
          expected_handover_date?: string | null
          id?: string
          is_active?: boolean | null
          legal_documents?: string | null
          legal_status?: string | null
          name?: string
          project_type?: string | null
          province?: string | null
          start_date?: string | null
          total_units?: number | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_contracts: {
        Row: {
          agreed_commission_rate: number
          booking_id: string | null
          contract_file_url: string | null
          contract_number: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          distribution_contract_id: string
          expected_commission_amount: number
          f2_agency_id: string | null
          id: string
          notes: string | null
          sales_id: string
          signed_date: string
          status: Database["public"]["Enums"]["sale_contract_status"]
          team_leader_id: string | null
          total_value: number
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          agreed_commission_rate: number
          booking_id?: string | null
          contract_file_url?: string | null
          contract_number: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          distribution_contract_id: string
          expected_commission_amount: number
          f2_agency_id?: string | null
          id?: string
          notes?: string | null
          sales_id: string
          signed_date: string
          status?: Database["public"]["Enums"]["sale_contract_status"]
          team_leader_id?: string | null
          total_value: number
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          agreed_commission_rate?: number
          booking_id?: string | null
          contract_file_url?: string | null
          contract_number?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          distribution_contract_id?: string
          expected_commission_amount?: number
          f2_agency_id?: string | null
          id?: string
          notes?: string | null
          sales_id?: string
          signed_date?: string
          status?: Database["public"]["Enums"]["sale_contract_status"]
          team_leader_id?: string | null
          total_value?: number
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_contracts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_contracts_distribution_contract_id_fkey"
            columns: ["distribution_contract_id"]
            isOneToOne: false
            referencedRelation: "distribution_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_contracts_f2_agency_id_fkey"
            columns: ["f2_agency_id"]
            isOneToOne: false
            referencedRelation: "f2_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_contracts_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_contracts_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          area_built: number | null
          area_usable: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          code: string
          commission_rate: number | null
          created_at: string | null
          created_by: string | null
          current_sales_id: string | null
          direction: string | null
          floor: string | null
          id: string
          list_price: number
          notes: string | null
          project_id: string
          status: Database["public"]["Enums"]["unit_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          unit_number: string | null
          unit_type: string | null
          updated_at: string | null
          view_description: string | null
        }
        Insert: {
          area_built?: number | null
          area_usable?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          code: string
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_sales_id?: string | null
          direction?: string | null
          floor?: string | null
          id?: string
          list_price: number
          notes?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["unit_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          unit_number?: string | null
          unit_type?: string | null
          updated_at?: string | null
          view_description?: string | null
        }
        Update: {
          area_built?: number | null
          area_usable?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          code?: string
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_sales_id?: string | null
          direction?: string | null
          floor?: string | null
          id?: string
          list_price?: number
          notes?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["unit_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          unit_number?: string | null
          unit_type?: string | null
          updated_at?: string | null
          view_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_current_sales_id_fkey"
            columns: ["current_sales_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_revenue_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Views: {
      view_expense_analysis: {
        Row: {
          category: Database["public"]["Enums"]["cost_category"] | null
          month: number | null
          total_amount: number | null
          total_including_vat: number | null
          total_vat: number | null
          transaction_count: number | null
          year: number | null
        }
        Relationships: []
      }
      view_internal_commission_summary: {
        Row: {
          recipient_name: string | null
          recipient_type: string | null
          total_amount_before_tax: number | null
          total_net_to_pay: number | null
          total_paid: number | null
          total_pending: number | null
          total_pit: number | null
          total_records: number | null
        }
        Relationships: []
      }
      view_profit_loss: {
        Row: {
          direct_cost: number | null
          gross_profit: number | null
          month: number | null
          net_profit: number | null
          operating_cost: number | null
          project_name: string | null
          revenue: number | null
          year: number | null
        }
        Relationships: []
      }
      view_revenue_overview: {
        Row: {
          developer_name: string | null
          project_id: string | null
          project_name: string | null
          total_contracts: number | null
          total_expected_revenue: number | null
          total_receivable_from_developer: number | null
          total_received_revenue: number | null
          total_sales_value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_sale_contract_full: {
        Args: {
          p_agreed_commission_rate: number
          p_booking_id: string
          p_customer_id: string
          p_distribution_contract_id: string
          p_payment_schedules: Json
          p_sales_id: string
          p_signed_date: string
          p_total_value: number
          p_unit_id: string
        }
        Returns: string
      }
      fn_allocate_shared_cost_by_revenue: {
        Args: { p_expense_id: string }
        Returns: undefined
      }
      fn_auto_create_payment_reminders: { Args: never; Returns: undefined }
      fn_auto_expire_bookings: { Args: never; Returns: undefined }
      fn_capture_monthly_kpi: { Args: never; Returns: undefined }
      fn_cleanup_old_logs: { Args: never; Returns: undefined }
      fn_create_sale_contract_atomic: {
        Args: {
          p_contract_number: string
          p_customer_id: string
          p_dist_contract_id: string
          p_installment_pcts: number[]
          p_sales_id: string
          p_signed_date: string
          p_total_value: number
          p_unit_id: string
        }
        Returns: string
      }
      fn_recognize_and_split_commission: {
        Args: {
          p_base_amount: number
          p_contract_id: string
          p_recognition_date: string
          p_record_number: string
        }
        Returns: string
      }
      get_90d_cashflow_forecast: {
        Args: never
        Returns: {
          expected_amount: number
          period: string
        }[]
      }
      get_dashboard_stats: {
        Args: {
          p_end_date?: string
          p_ma_nv?: string
          p_role?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_financial_summary: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      set_current_user_name: { Args: { user_name: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      agency_tier: "F1" | "F2"
      booking_status: "active" | "converted" | "cancelled" | "expired"
      cancellation_type:
        | "before_contract"
        | "after_contract"
        | "developer_fault"
      commission_status: "pending" | "recognized" | "received" | "reversed"
      cost_category:
        | "commission_to_sales"
        | "commission_to_f2"
        | "salary"
        | "social_insurance"
        | "marketing"
        | "event_open_sale"
        | "office_rent"
        | "sample_house"
        | "utilities"
        | "travel"
        | "training"
        | "software_it"
        | "other_selling"
        | "other_admin"
      cost_period_type: "one_time" | "monthly" | "project_specific"
      employee_role:
        | "sales"
        | "team_leader"
        | "sales_manager"
        | "accountant"
        | "admin"
      internal_commission_status:
        | "calculated"
        | "approved"
        | "paid"
        | "clawed_back"
      payment_schedule_status:
        | "pending"
        | "due"
        | "paid"
        | "overdue"
        | "cancelled"
      sale_contract_status:
        | "draft"
        | "signed"
        | "paying"
        | "completed"
        | "handed_over"
        | "cancelled"
      unit_status:
        | "available"
        | "reserved"
        | "contracted"
        | "handed_over"
        | "cancelled"
        | "locked"
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
      agency_tier: ["F1", "F2"],
      booking_status: ["active", "converted", "cancelled", "expired"],
      cancellation_type: [
        "before_contract",
        "after_contract",
        "developer_fault",
      ],
      commission_status: ["pending", "recognized", "received", "reversed"],
      cost_category: [
        "commission_to_sales",
        "commission_to_f2",
        "salary",
        "social_insurance",
        "marketing",
        "event_open_sale",
        "office_rent",
        "sample_house",
        "utilities",
        "travel",
        "training",
        "software_it",
        "other_selling",
        "other_admin",
      ],
      cost_period_type: ["one_time", "monthly", "project_specific"],
      employee_role: [
        "sales",
        "team_leader",
        "sales_manager",
        "accountant",
        "admin",
      ],
      internal_commission_status: [
        "calculated",
        "approved",
        "paid",
        "clawed_back",
      ],
      payment_schedule_status: [
        "pending",
        "due",
        "paid",
        "overdue",
        "cancelled",
      ],
      sale_contract_status: [
        "draft",
        "signed",
        "paying",
        "completed",
        "handed_over",
        "cancelled",
      ],
      unit_status: [
        "available",
        "reserved",
        "contracted",
        "handed_over",
        "cancelled",
        "locked",
      ],
    },
  },
} as const
