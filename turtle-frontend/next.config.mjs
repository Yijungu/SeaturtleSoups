/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_NAVER_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
    NEXT_PUBLIC_NAVER_REDIRECT_URI: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI,
  },
  images: {
    domains: ['seaturtlesoupposter.s3.amazonaws.com'], // 이미지 도메인 허용 추가
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export const metadataBase = new URL('https://www.seaturtlesoups.com');
export default nextConfig;
