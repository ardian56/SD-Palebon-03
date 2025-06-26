# Environment Setup Guide

## Quick Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your actual configuration.

## Required Environment Variables

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

To get these values:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the URL and anon key

### MongoDB Configuration
- `MONGODB_URI`: Your MongoDB connection string

Options:
- **Local MongoDB**: `mongodb://localhost:27017/sd_palebon_db`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/sd_palebon_db`

### Optional Variables

#### Authentication (NextAuth.js)
- `NEXTAUTH_URL`: Your application URL (default: `http://localhost:3000`)
- `NEXTAUTH_SECRET`: Random secret key for NextAuth.js

#### Email Configuration
- `EMAIL_HOST`: SMTP host (e.g., `smtp.gmail.com`)
- `EMAIL_PORT`: SMTP port (e.g., `587`)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email password or app-specific password

#### File Upload (Cloudinary)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

#### Security
- `JWT_SECRET`: Random secret key for JWT tokens

## Important Notes

- Never commit `.env.local` to your repository
- Use `.env.example` as a template for other developers
- For production, use your hosting platform's environment variable settings
- Prefix client-side variables with `NEXT_PUBLIC_`

## Development vs Production

- **Development**: Use `.env.local`
- **Production**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)
