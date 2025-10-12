# Memory Line - Setup Guide

## New Architecture: PlanetScale + Cloudinary + NextAuth

This app now uses a much better architecture that's perfect for Indian users and offers generous free tiers.

### 🗄️ Database: PlanetScale
- **Free Tier**: 5 GB database, 1 billion reads/month
- **Benefits**: Fast, scalable, no region restrictions
- **Setup**: Create account at [planetscale.com](https://planetscale.com)

### ☁️ Storage: Cloudinary
- **Free Tier**: 25 GB storage + 25k transformations/month
- **Benefits**: Auto-optimization, global CDN, video streaming
- **Setup**: Create account at [cloudinary.com](https://cloudinary.com)

### 🔐 Authentication: NextAuth
- **Providers**: Google, GitHub, Email (your choice)
- **Benefits**: Secure, easy to implement
- **Setup**: Configure OAuth providers

## Setup Instructions

### 1. PlanetScale Setup
1. Go to [planetscale.com](https://planetscale.com) and create an account
2. Create a new database
3. Go to "Connect" → "Connect with" → "Node.js"
4. Copy the connection string
5. Add to `.env.local`:
```env
DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"
```

### 2. Cloudinary Setup
1. Go to [cloudinary.com](https://cloudinary.com) and create an account
2. Go to Dashboard → Settings → API Keys
3. Copy your Cloud Name, API Key, and API Secret
4. Add to `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3. Database Schema
Run the SQL in `database-schema.sql` in your PlanetScale database:
```sql
-- Copy and paste the contents of database-schema.sql
```

### 4. NextAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 5. Deploy to Vercel
1. Push your code to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## Benefits of This Architecture

### ✅ For Indian Users
- No Firebase Free Tier restrictions
- Global CDN for fast loading
- No region-based limitations

### ✅ Performance
- PlanetScale: Fast database queries
- Cloudinary: Auto-optimized images/videos
- NextAuth: Secure authentication

### ✅ Cost-Effective
- PlanetScale: 5 GB free (thousands of memories)
- Cloudinary: 25 GB free (plenty for photos/videos)
- Vercel: Generous free tier

### ✅ Scalable
- PlanetScale: Handles millions of users
- Cloudinary: Professional media management
- NextAuth: Industry-standard auth

## File Structure
```
src/
├── lib/
│   ├── database.js      # PlanetScale queries
│   └── cloudinary.js    # Cloudinary upload/optimization
├── app/
│   ├── api/
│   │   ├── upload/      # File upload to Cloudinary
│   │   ├── memories/    # CRUD operations
│   │   └── auth/        # NextAuth configuration
│   └── add-memory/      # Upload form
└── components/
    └── ErrorBoundary.js # Error handling
```

## Testing
1. Start development server: `npm run dev`
2. Go to `/add-memory`
3. Upload a photo/video
4. Check browser console for any errors
5. Verify in PlanetScale dashboard

## Troubleshooting
- Check environment variables are set correctly
- Verify PlanetScale database is accessible
- Check Cloudinary API keys are correct
- Look at browser console for detailed errors