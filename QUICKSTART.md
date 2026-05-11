# Quick Start Guide

Get the Staff Attendance Management System running in 5 minutes.

## Prerequisites

- **Node.js** 18+ or **Bun** installed
- **Git** installed
- **Supabase** account (free at https://supabase.com)

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/staff-pulse.git
cd staff-pulse
```

## Step 2: Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to **Project Settings** → **API**
3. Copy your:
   - `Project URL`
   - `Anon Public Key`

## Step 3: Configure Environment

Create `.env.local` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Install & Run

```bash
# Install dependencies
bun install
# or: npm install

# Start development server
bun run dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 5: Login

Use demo credentials:
- **Email**: demo@example.com
- **Password**: demo123456

> **Note**: If credentials don't work, create a new account via the signup form.

## Next Steps

1. **Add Employees**: Go to Employees page → "+ Add Employee"
2. **Mark Attendance**: Go to Attendance page → Select date → Mark status
3. **View Reports**: Go to Reports page → Select date range
4. **Export Data**: Click "Export CSV" on Reports page

## Troubleshooting

### Port Already in Use
```bash
# Change port (default: 5173)
bun run dev -- --port 3000
```

### Module Not Found
```bash
# Clear and reinstall
bun install --force
# or: npm install --force
```

### Can't Connect to Supabase
- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Ensure API key is not revoked

## Key Features

✅ Employee Management - Add, edit, delete employees  
✅ Attendance Marking - Mark daily attendance  
✅ Reports & Analytics - View trends and statistics  
✅ CSV Export - Download attendance data  
✅ Search & Filter - Find records quickly  

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

**Need Help?** Check README.md for comprehensive documentation.
