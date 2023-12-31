export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      timetables: {
        Row: {
          by: string | null
          created: string | null
          data: string | null
          id: number
          name: string
        }
        Insert: {
          by?: string | null
          created?: string | null
          data?: string | null
          id?: number
          name: string
        }
        Update: {
          by?: string | null
          created?: string | null
          data?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetables_by_fkey"
            columns: ["by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
