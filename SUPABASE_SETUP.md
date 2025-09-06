# 🚀 Construction File Sharing Platform - Supabase Setup Guide

This guide will help you set up persistent file storage using **Supabase** (free tier with 500MB storage) for your Construction File Sharing Platform.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js project**: Your existing file-sharing platform

## 🔧 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Set project details:
   - **Name**: `construction-file-sharing`
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to you

### 2. Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: `eyJ...` (long key starting with eyJ)

### 3. Set Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://vdyuepooqnkwyxnjncva.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration  
PORT=3000
NODE_ENV=production
```

### 4. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `database/setup.sql`
4. Click **Run** to create the database tables

### 5. Configure Storage

1. In Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Bucket details:
   - **Name**: `construction-files`
   - **Public**: ✅ Check this box
4. Click **Create bucket**

### 6. Set Storage Policies

In **Storage** → **construction-files** → **Policies**:

**Policy 1 - Public Read Access:**
```sql
-- Allow anyone to read files
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'construction-files');
```

**Policy 2 - Public Upload Access:**
```sql
-- Allow anyone to upload files  
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'construction-files');
```

### 7. Update Environment Variables in Render

If deploying to Render, add these environment variables:

```
SUPABASE_URL=https://vdyuepooqnkwyxnjncva.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
```

## 🧪 Testing

1. **Local Testing**:
   ```bash
   cd file-sharing-platform
   npm start
   ```

2. **Upload a file** via the web interface
3. **Check Supabase**:
   - **Storage** → **construction-files** → Should see uploaded files
   - **Table Editor** → **files** → Should see file metadata

## ✅ Benefits of Supabase

- **✅ Free Tier**: 500MB storage, 2GB bandwidth/month
- **✅ Persistent**: Files never disappear (unlike Render local storage)
- **✅ Fast**: Global CDN for file delivery
- **✅ Secure**: Built-in authentication and RLS policies
- **✅ Scalable**: Easy to upgrade as you grow

## 🔐 Security Notes

- **Row Level Security (RLS)** is enabled by default
- **Public access** is configured for demo purposes
- For production, implement proper authentication
- Consider file size limits and virus scanning

## 🐛 Troubleshooting

**"Could not find bucket":**
- Ensure bucket name is exactly `construction-files`
- Check bucket is created and public

**"Insert failed":**
- Verify database table exists (`files` table)
- Check RLS policies allow inserts

**"Upload failed":**
- Confirm environment variables are set correctly
- Check Supabase service key permissions

## 📊 Monitoring Usage

Monitor your Supabase usage in the dashboard:
- **Storage**: Files uploaded and bandwidth used
- **Database**: Queries and storage
- **Authentication**: If you add user login later

## 🚀 Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created (`files`)
- [ ] Storage bucket created (`construction-files`)  
- [ ] Storage policies configured
- [ ] Environment variables set locally
- [ ] Environment variables set in Render
- [ ] File upload/download tested

---

**🎉 Your files will now persist permanently in Supabase, even when your Render server restarts!**
