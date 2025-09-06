# 🎯 COMPLETE SUPABASE DEPLOYMENT CHECKLIST

## ✅ Step 1: Get Real Supabase Credentials

### 1.1 Create Supabase Account
- [ ] Go to **https://supabase.com**
- [ ] Click **"Start your project"** or **"Sign in"**
- [ ] Sign up with GitHub, Google, or email

### 1.2 Create New Project
- [ ] Click **"New Project"**
- [ ] Choose organization
- [ ] Set project name: `construction-files`
- [ ] Create secure database password (save it!)
- [ ] Choose region closest to you
- [ ] Click **"Create new project"**
- [ ] Wait 2-3 minutes for setup

### 1.3 Get API Keys ⚡ **CRITICAL**
- [ ] Go to **Settings** → **API** (gear icon in sidebar)
- [ ] Copy **Project URL**: `https://xxxxx.supabase.co`
- [ ] Copy **anon public key**: `eyJhbGci...` (long key, ~400+ characters)

## ✅ Step 2: Set Environment Variables

### 2.1 Local Development (PowerShell)
```powershell
$env:SUPABASE_URL = "https://your-project-id.supabase.co"
$env:SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_REAL_ANON_KEY"
```
⚠️ **Replace YOUR_REAL_ANON_KEY with the actual key from Step 1.3**

### 2.2 Verify Keys Are Set
```powershell
echo $env:SUPABASE_URL
echo $env:SUPABASE_ANON_KEY
```
Should show your real values, NOT placeholders!

## ✅ Step 3: Set Up Database & Storage

### 3.1 Create Database Table
- [ ] In Supabase dashboard → **SQL Editor**
- [ ] Click **"New query"**
- [ ] Copy & paste entire contents of `database/setup.sql`
- [ ] Click **"Run"** button
- [ ] Verify: Go to **Table Editor** → should see `files` table

### 3.2 Create Storage Bucket
- [ ] In Supabase dashboard → **Storage**
- [ ] Click **"Create a new bucket"**
- [ ] Bucket name: `construction-files` (exactly this name!)
- [ ] **Check "Public bucket"** ✅
- [ ] Click **"Create bucket"**

### 3.3 Set Storage Policies
- [ ] Click on `construction-files` bucket
- [ ] Go to **Policies** tab
- [ ] Click **"New policy"**
- [ ] Choose **"For full customization"**
- [ ] Policy 1:
  ```sql
  CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'construction-files');
  ```
- [ ] Policy 2:
  ```sql
  CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'construction-files');
  ```

## ✅ Step 4: Deploy to Render

### 4.1 Update Render Environment Variables
- [ ] Go to **Render dashboard** → your service
- [ ] Click **"Environment"**
- [ ] Add/Update:
  ```
  SUPABASE_URL = https://your-project-id.supabase.co
  SUPABASE_ANON_KEY = eyJhbGci...your-real-anon-key...
  ```

### 4.2 Deploy Code Changes
```powershell
git push origin main
```

## ✅ Step 5: Test Everything

### 5.1 Test Local Server
```powershell
node backend/test-supabase.js
```
Should show: "✅ Successfully fetched X files"

### 5.2 Test Live Website
- [ ] Go to **https://fileunit-1.onrender.com**
- [ ] Upload a test file
- [ ] Check Supabase Storage → should see uploaded file
- [ ] Check Table Editor → should see file metadata

## 🔥 Common Mistakes to Avoid

❌ **DON'T** use `"your-actual-key-here"` - use the real 400+ character key
❌ **DON'T** forget to make storage bucket public
❌ **DON'T** use wrong bucket name (must be `construction-files`)
❌ **DON'T** skip the database setup SQL
❌ **DON'T** forget to add environment variables to Render

## ✅ Success Indicators

You'll know everything works when:
- ✅ No warnings about missing SUPABASE_ANON_KEY
- ✅ Files uploaded locally appear in Supabase Storage
- ✅ Files uploaded on Render appear in Supabase Storage  
- ✅ Files persist even after Render server restarts
- ✅ Console shows "Successfully fetched X files"

## 🆘 Troubleshooting

**"WARNING: SUPABASE_ANON_KEY environment variable not set!"**
→ You're still using placeholder key. Get real key from Step 1.3

**"Could not find bucket construction-files"**
→ Create bucket in Step 3.2, make it public

**"Insert failed" or "Access denied"**
→ Set up storage policies in Step 3.3

**"Table files doesn't exist"**
→ Run database setup SQL in Step 3.1

---

🎉 **Once complete: Your files will NEVER disappear again!**
