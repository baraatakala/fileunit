# 🚀 Supabase Setup Quick Fix

## The Problem
Your platform is running perfectly, but uploads fail with `Bucket not found` because the Supabase storage bucket doesn't exist yet.

## The Solution (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `vdyuepooqnkwyxnjncva`

### Step 2: Create Storage Bucket
1. Go to **Storage** in the sidebar
2. Click **New Bucket**
3. Bucket name: `construction-files`
4. Make it **Public**: ✅ 
5. Click **Create Bucket**

### Step 3: Set Bucket Policies (Optional - Already Public)
If you want more control, go to **Storage > Policies** and add:
- **Allow public uploads**
- **Allow public downloads** 
- **Allow public deletes**

### Step 4: Alternative - SQL Method
Copy and paste this into **SQL Editor**:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-files', 'construction-files', true);

-- Verify it worked
SELECT * FROM storage.buckets WHERE id = 'construction-files';
```

## ✅ Expected Result
After creating the bucket, your file uploads should work immediately - no restart needed!

## Test It
1. Go to https://fileunit-1.onrender.com
2. Try uploading a file
3. Should work without errors

---

**Your platform is 95% working - just missing the storage bucket! 🎉**
