# API Documentation

## Database Schema & Types

### Employees Table

**TypeScript Type:**
```typescript
export type Employee = {
  id: string;                              // UUID (auto-generated)
  name: string;                            // Employee full name
  employee_id: string;                     // Unique identifier (UNIQUE constraint)
  email: string;                           // Email address (UNIQUE constraint)
  phone: string;                           // Contact phone number
  department: string;                      // Department name
  role: string;                            // Job title/role
  status: "Active" | "Inactive";          // Employment status
  created_at: string;                      // ISO timestamp
  updated_at: string;                      // ISO timestamp
};
```

**SQL Schema:**
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Attendance Table

**TypeScript Type:**
```typescript
export type Attendance = {
  id: string;                                    // UUID (auto-generated)
  employee_id: string;                          // Reference to employee
  employee_name: string;                        // Denormalized employee name
  status: "Present" | "Absent" | "Late";       // Attendance status
  date: string;                                 // Date (YYYY-MM-DD format)
  check_in_time: string | null;                 // Check-in time (HH:MM format)
  created_at: string;                           // ISO timestamp
  updated_at: string;                           // ISO timestamp
};
```

**SQL Schema:**
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  date DATE NOT NULL,
  check_in_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date),  -- Prevent duplicate entries per day
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);
```

---

## API Operations

### Authentication

#### Sign Up
```typescript
// Email/password signup
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "securepassword123"
});

// Response: User object with session (if auto-confirm enabled)
```

#### Sign In
```typescript
// Email/password login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "securepassword123"
});

// Response: User object with session
// Session automatically stored in localStorage
```

#### Sign Out
```typescript
await supabase.auth.signOut();
// Clears session from localStorage
```

#### Get Session
```typescript
const { data } = await supabase.auth.getSession();
const session = data.session;  // null if not authenticated
```

---

### Employees API

#### Create Employee
```typescript
const { data, error } = await supabase
  .from("employees")
  .insert({
    name: "John Doe",
    employee_id: "EMP001",
    email: "john@company.com",
    phone: "555-1234",
    department: "Engineering",
    role: "Software Engineer",
    status: "Active"
  })
  .select()
  .single();
```

#### Read All Employees
```typescript
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .order("created_at", { ascending: false });

// Returns: Employee[]
```

#### Read Single Employee
```typescript
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .eq("id", employeeId)
  .single();

// Returns: Employee
```

#### Update Employee
```typescript
const { data, error } = await supabase
  .from("employees")
  .update({
    name: "Jane Doe",
    role: "Senior Engineer"
  })
  .eq("id", employeeId)
  .select()
  .single();
```

#### Delete Employee
```typescript
const { error } = await supabase
  .from("employees")
  .delete()
  .eq("id", employeeId);
```

#### Search Employees
```typescript
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .or(`name.ilike.%${query}%,email.ilike.%${query}%,employee_id.ilike.%${query}%`);

// Returns: Employee[] matching query
```

#### Filter by Department
```typescript
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .eq("department", "Engineering");

// Returns: Employee[]
```

---

### Attendance API

#### Mark/Update Attendance (Upsert)
```typescript
// This automatically handles duplicates
// If record exists for employee+date, it updates; otherwise inserts
const { data, error } = await supabase
  .from("attendance")
  .upsert({
    employee_id: "EMP001",
    employee_name: "John Doe",
    status: "Present",
    date: "2026-05-11",
    check_in_time: "09:30"
  }, {
    onConflict: "employee_id,date"  // Unique constraint
  })
  .select()
  .single();
```

#### Get Attendance by Date
```typescript
const { data, error } = await supabase
  .from("attendance")
  .select("*")
  .eq("date", "2026-05-11")
  .order("created_at", { ascending: false });

// Returns: Attendance[]
```

#### Get Attendance Range
```typescript
const { data, error } = await supabase
  .from("attendance")
  .select("*")
  .gte("date", "2026-05-01")
  .lte("date", "2026-05-31")
  .order("date", { ascending: false });

// Returns: Attendance[] for date range
```

#### Get Employee Attendance History
```typescript
const { data, error } = await supabase
  .from("attendance")
  .select("*")
  .eq("employee_id", "EMP001")
  .order("date", { ascending: false })
  .limit(30);

// Returns: Attendance[] (last 30 records)
```

#### Filter by Status
```typescript
const { data, error } = await supabase
  .from("attendance")
  .select("*")
  .eq("status", "Present")
  .gte("date", "2026-05-01")
  .lte("date", "2026-05-31");

// Returns: Attendance[] with status "Present"
```

---

## Error Handling

### Common Error Patterns

```typescript
try {
  const { data, error } = await supabase
    .from("employees")
    .select("*");
  
  if (error) {
    // Handle Supabase errors
    console.error("Database error:", error.message);
    toast.error(error.message);
    return;
  }
  
  // Success
  console.log("Data:", data);
} catch (err) {
  // Handle unexpected errors
  console.error("Unexpected error:", err);
  toast.error("An unexpected error occurred");
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Network/CORS issue | Check internet connection, verify domain in Supabase |
| "Invalid credentials" | Wrong email/password | Verify credentials are correct |
| "Duplicate key" | Employee ID/email exists | Use unique values or update instead of insert |
| "UNIQUE constraint failed" | Attendance already marked | Use upsert instead of insert |
| "Unauthorized" | Missing/invalid auth token | Check authentication session |

---

## Performance Tips

### Query Optimization

```typescript
// ✅ GOOD: Only select needed fields
const { data } = await supabase
  .from("employees")
  .select("id, name, email")  // Specific columns
  .limit(10);

// ❌ SLOW: Select all fields
const { data } = await supabase
  .from("employees")
  .select("*");
```

### Pagination

```typescript
const pageSize = 10;
const page = 1;
const from = (page - 1) * pageSize;
const to = from + pageSize - 1;

const { data, error, count } = await supabase
  .from("employees")
  .select("*", { count: "exact" })
  .range(from, to);
```

### Real-time Subscriptions (Advanced)

```typescript
// Listen for changes to employees table
const subscription = supabase
  .channel("employees")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "employees" },
    (payload) => {
      console.log("Change received!", payload);
      // Update UI accordingly
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Rate Limits

Supabase free tier includes:
- **API Calls**: 50,000/day
- **Database**: 500MB storage
- **Auth**: Unlimited users

---

## Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Row Level Security (RLS)** - Enable in Supabase settings
3. **Validate input** - Always validate on client and server
4. **Use HTTPS only** - Application enforces this
5. **Rotate credentials** - Regenerate keys periodically

---

## Support

For API issues:
- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client API](https://supabase.com/docs/reference/javascript/introduction)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Last Updated**: May 11, 2026
