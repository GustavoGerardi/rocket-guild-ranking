import type { Json } from './guild.ts';

// Mirrors supabase/schema.sql; imported JSON is validated before becoming guild data.
export interface Database {
  public: {
    Tables: {
      guild_imports: {
        Row: {
          id: string;
          data: Json;
          file_name: string;
          imported_at: string;
        };
        Insert: {
          id: string;
          data: Json;
          file_name: string;
          imported_at?: string;
        };
        Update: {
          id?: string;
          data?: Json;
          file_name?: string;
          imported_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [key in never]: never };
    Functions: { [key in never]: never };
    Enums: { [key in never]: never };
    CompositeTypes: { [key in never]: never };
  };
}
