export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string;
          respondent_name: string | null;
          respondent_role: string | null;
          headline: string;
          focus_area: string | null;
          priority: Database["public"]["Enums"]["submission_priority"];
          status: Database["public"]["Enums"]["submission_status"];
          responses: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          respondent_name?: string | null;
          respondent_role?: string | null;
          headline: string;
          focus_area?: string | null;
          priority?: Database["public"]["Enums"]["submission_priority"];
          status?: Database["public"]["Enums"]["submission_status"];
          responses: Json;
          created_at?: string;
        };
        Update: {
          respondent_name?: string | null;
          respondent_role?: string | null;
          headline?: string;
          focus_area?: string | null;
          priority?: Database["public"]["Enums"]["submission_priority"];
          status?: Database["public"]["Enums"]["submission_status"];
          responses?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      submission_priority: "Low" | "Medium" | "High" | "Critical";
      submission_status: "New" | "In Review" | "Closed";
    };
    CompositeTypes: Record<string, never>;
  };
};
