/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://juego-cartas-back.onrender.com/api/:path*',
      },
    ]
  },
};

export default nextConfig;
