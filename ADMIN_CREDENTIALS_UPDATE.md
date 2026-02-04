# Admin Credentials Update Guide

## ✅ COMPLETED UPDATES

Your admin credentials have been updated throughout the codebase:

### New Admin Credentials
- **Username**: `sanjaiii`
- **Password**: `sanjaiii_portfolio`

## 🔄 What Has Been Updated

### 1. Demo Mode (No Database) ✅
- Updated: `server/routes/auth.js`
- Now accepts: `sanjaiii` / `sanjaiii_portfolio`

### 2. Password Hash Generator ✅
- Updated: `scripts/generate-admin-hash.js`
- Generated hash: `$2a$10$lOHcL470GJr7JhAwzQyDHuwgNFkVYYLRYzSLlE8aNdhrdFrzboe.S`

### 3. PostgreSQL Schema ✅
- Updated: `database/schema-postgres.sql`
- Default admin now uses new credentials

### 4. Neon Database Setup Script ✅
- Updated: `scripts/setup-neon-database.js`
- Will create admin with new credentials

### 5. New Update Script Created ✅
- Created: `scripts/update-admin-credentials.js`
- Automatically updates existing database

## 📝 Database Update Instructions

### For PostgreSQL/Neon Database (Vercel Production):

**Option 1: Run the Update Script** (Recommended)
```bash
node scripts/update-admin-credentials.js
```

This script will:
- Connect to your production database
- Update the admin credentials automatically
- Show confirmation message

**Option 2: Manual SQL Update**
If you prefer to run SQL directly:

```sql
UPDATE admin 
SET username = 'sanjaiii', 
    password_hash = '$2a$10$lOHcL470GJr7JhAwzQyDHuwgNFkVYYLRYzSLlE8aNdhrdFrzboe.S',
    email = 'sanjai@portfolio.com'
WHERE id = 1;
```

### For MySQL Database (Local Development):

**Option 1: Run MySQL Update Script**
```bash
node scripts/generate-admin-hash.js
```

Then copy the SQL command and run it in your MySQL database.

**Option 2: Use the provided SQL**
```sql
UPDATE admin 
SET username = 'sanjaiii', 
    password_hash = '$2a$10$lOHcL470GJr7JhAwzQyDHuwgNFkVYYLRYzSLlE8aNdhrdFrzboe.S',
    email = 'sanjai@portfolio.com'
WHERE id = 1;
```

## 🚀 For Vercel Deployment

### Step 1: Update Environment Variables (If Needed)
The credentials are stored in the database, not in environment variables, so you don't need to update Vercel environment variables.

### Step 2: Update Production Database

**Method A: Using the Update Script** (Easiest)
1. Make sure you have a `.env` file with your DATABASE_URL:
   ```env
   DATABASE_URL=postgres://your-neon-connection-string
   ```
   OR
   ```env
   POSTGRES_URL=postgres://your-neon-connection-string
   ```

2. Run the update script:
   ```bash
   node scripts/update-admin-credentials.js
   ```

**Method B: Using Neon Dashboard**
1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Go to "SQL Editor"
4. Run this SQL:
   ```sql
   UPDATE admin 
   SET username = 'sanjaiii', 
       password_hash = '$2a$10$lOHcL470GJr7JhAwzQyDHuwgNFkVYYLRYzSLlE8aNdhrdFrzboe.S',
       email = 'sanjai@portfolio.com'
   WHERE id = 1;
   ```

**Method C: Using Railway Dashboard** (if using Railway)
1. Go to your Railway dashboard
2. Open your database
3. Go to "Query" tab
4. Run the same SQL as above

### Step 3: Verify Update
1. Go to your live site: `https://your-site.vercel.app/admin/login`
2. Login with:
   - Username: `sanjaiii`
   - Password: `sanjaiii_portfolio`

## 🔍 How to Find Your Database Connection String

### Neon Database:
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (looks like: `postgres://user:pass@host/db`)

### Railway Database:
1. Go to https://railway.app
2. Select your project
3. Click on your PostgreSQL database
4. Go to "Connect" tab
5. Copy the "Postgres Connection URL"

### PlanetScale:
1. Go to https://planetscale.com
2. Select your database
3. Click "Connect"
4. Copy the connection string

## ✅ Verification Checklist

After updating, verify:
- [ ] Can login with username: `sanjaiii`
- [ ] Can login with password: `sanjaiii_portfolio`
- [ ] Old credentials (`admin`/`admin123`) no longer work
- [ ] Can access admin dashboard
- [ ] Can create/edit projects
- [ ] Can upload images

## 🆘 Troubleshooting

### "Invalid credentials" error
- Make sure the database has been updated
- Check that you're using the exact credentials (case-sensitive)
- Clear browser cache and try again

### Cannot connect to database
- Verify DATABASE_URL or POSTGRES_URL is set correctly
- Check if database is online
- Ensure IP is whitelisted (some providers require this)

### Script fails to run
- Make sure you have installed dependencies: `npm install`
- Check that .env file exists with correct DATABASE_URL
- Verify the connection string format

## 📞 Support

If you encounter any issues:
1. Check the error message in console
2. Verify database connection string
3. Make sure all npm packages are installed
4. Check that the database is accessible

---

**Last Updated**: February 4, 2026
**Admin Username**: sanjaiii
**Admin Password**: sanjaiii_portfolio
