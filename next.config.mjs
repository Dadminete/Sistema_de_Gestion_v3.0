/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://172.16.0.23:3000",
    "http://172.16.0.23",
    "localhost",
    "172.16.0.23",
  ],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard/crm",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
}

export default nextConfig
