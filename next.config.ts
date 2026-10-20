/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./app/theme/colors.css"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hshrizhbgvfjnhjmnwfp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
