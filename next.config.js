const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: false, // Enable PWA in dev so user can verify on mobile
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow mobile testing on local network
  experimental: {
    allowedDevOrigins: ['localhost:3000', '192.168.0.162:3000'],
  },
  // ১. সব জায়গা থেকে ইমেজ লোড করার পারমিশন
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ২. টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড আটকাবে না
  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

// এই লাইনটি .js ফাইলের জন্য জরুরি
module.exports = withPWA(nextConfig);