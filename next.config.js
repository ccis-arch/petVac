/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard/dashboard",
        permanent: false,
      },
      {
        source: "/admin/dashboard",
        destination: "/admin/dashboard/dashboard",
        permanent: false,
      },
      {
        source: "/personnel/dashboard",
        destination: "/personnel/dashboard/dashboard",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
