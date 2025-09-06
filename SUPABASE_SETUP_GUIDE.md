# 🚀 Supabase Project Setup Guide

## Step 1: Create New Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `file-sharing-platform` (or any name you like)
   - **Database Password**: Choose a strong password (save it somewhere safe!)
   - **Region**: Choose closest to you (e.g., `us-east-1` for US East Coast)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

## Step 2: Get API Credentials
1. Once project is ready, go to **Settings → API**
2. Copy these values:

### Project URL
Should look like: `https://abcd1234.supabase.co` (8-character ref)

### API Key (anon public)
Should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update .env File
Replace the values in your `.env` file:

```env
SUPABASE_URL=https://YOUR_REAL_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_real_anon_key_here
```

## Step 4: Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and run the contents of `database/setup.sql`
3. This creates the `files` table and storage policies

## Step 5: Test Connection
```bash
cd backend
node test-supabase.js
```

---

**Important**: Only use credentials from YOUR actual project dashboard, never from examples or documentation!
