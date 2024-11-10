/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,  // 개발 시 엄격한 모드 사용
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_NAVER_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID, // 네이버 클라이언트 ID
    NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET, 
    NEXT_PUBLIC_NAVER_REDIRECT_URI: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI // 리디렉트 URI
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',  // 프론트엔드에서 /api 경로로 시작하는 요청
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,  // 백엔드로 프록시
      },
    ];
  },
};

export default nextConfig;
