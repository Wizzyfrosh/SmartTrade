# Supabase Storage Setup (UI Method)

Since the SQL script encountered permission errors, please follow these steps to set up the storage bucket and policies directly in the Supabase Dashboard. This method is safer and avoids the "must be owner" error.

## Step 1: Create the Bucket
1. Go to your **Supabase Dashboard**.
2. Click on the **Storage** icon (folder icon) in the left sidebar.
3. Click **"New Bucket"**.
4. Enter the name: `avatars`.
5. Toggle **"Public bucket"** to **ON**.
6. Click **"Save"**.

## Step 2: Add RLS Policies
1. In the **Storage** page, click on the **Policies** tab (or "Configuration" > "Policies").
2. Find the `avatars` bucket in the list.
3. You need to add 4 policies (View, Upload, Update, Delete).

### Policy 1: Public View Access
- Click **"New Policy"** under `avatars`.
- Select **"Get started quickly"** -> **"Give users access to all files"** (serving as a template) OR **"For full customization"**.
- Let's choose **"For full customization"**.
- **Policy Name**: `Public Access`
- **Allowed Operations**: Select **SELECT**.
- **Target roles**: Leave as `default` or select `anon` and `authenticated`.
- **USING expression**: `bucket_id = 'avatars'`
- Click **"Review"** then **"Save policy"**.

### Policy 2: Authenticated Uploads
- Click **"New Policy"**.
- **Policy Name**: `Authenticated Insert`
- **Allowed Operations**: Select **INSERT**.
- **Target roles**: `authenticated`.
- **USING expression**: `bucket_id = 'avatars'`
- **WITH CHECK expression**: `bucket_id = 'avatars'`
- Click **"Review"** then **"Save policy"**.

### Policy 3: Users Update Own Files
- Click **"New Policy"**.
- **Policy Name**: `User Update`
- **Allowed Operations**: Select **UPDATE**.
- **Target roles**: `authenticated`.
- **USING expression**: `bucket_id = 'avatars' AND auth.uid() = owner`
- **WITH CHECK expression**: `bucket_id = 'avatars' AND auth.uid() = owner`
- Click **"Review"** then **"Save policy"**.

### Policy 4: Users Delete Own Files
- Click **"New Policy"**.
- **Policy Name**: `User Delete`
- **Allowed Operations**: Select **DELETE**.
- **Target roles**: `authenticated`.
- **USING expression**: `bucket_id = 'avatars' AND auth.uid() = owner`
- Click **"Review"** then **"Save policy"**.

## Step 3: Verify
- Go back to your app.
- Try changing the profile picture again.
- It should now work without errors.
