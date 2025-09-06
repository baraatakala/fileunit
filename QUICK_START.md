# 🚀 Quick Start: Get Your Supabase Key

## Step 1: Get Your Supabase Account
1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign in"**
3. Sign up/in with GitHub, Google, or email

## Step 2: Create Project
1. Click **"New Project"**
2. Choose your organization
3. Project settings:
   - **Name**: `construction-files` (or any name)
   - **Database Password**: Make up a secure password
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for setup to complete

## Step 3: Get Your API Key
1. In your project dashboard, click **"Settings"** (gear icon in sidebar)
2. Click **"API"** from the settings menu
3. Under **"Project API keys"**, find:
   - **URL**: Copy this (should be like `https://abc123.supabase.co`)
   - **anon public**: Copy this long key (starts with `eyJ...`)

## Step 4: Update Your Code
Replace in your `.env` file:
```env
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...your-actual-key...
```

## Step 5: Set up Database & Storage
1. **Database**: Go to **SQL Editor** → Paste the SQL from `database/setup.sql` → Run
2. **Storage**: Go to **Storage** → **"Create a new bucket"** → Name it `construction-files` → Make it public

## Step 6: Deploy to Render
Add these environment variables in Render:
```
SUPABASE_URL=https://your-project-url.supabase.co  
SUPABASE_ANON_KEY=eyJhbGciOiJI...your-actual-key...
```

**That's it! Your files will now persist forever in Supabase! 🎉**
