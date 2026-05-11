import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sygbwqsooxujzykojvee.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Z2J3cXNvb3h1anp5a29qdmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODcyMTUsImV4cCI6MjA5NDA2MzIxNX0.o7aAInV-meZJJTyFjQFNAsNzK-47yB_ajKfpsGG51NY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export type Employee = {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
};

export type Attendance = {
  id: string;
  employee_id: string;
  employee_name: string;
  status: "Present" | "Absent" | "Late";
  date: string;
  check_in_time: string | null;
  created_at: string;
  updated_at: string;
};
