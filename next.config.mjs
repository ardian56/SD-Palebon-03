/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
       remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Matches any Supabase project URL
        port: '',
        pathname: '/storage/v1/object/public/images/**', // Path for public storage
      },
    ]
    },
  };
  
  export default nextConfig;
  