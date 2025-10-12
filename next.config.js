/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.gstatic.com'], // Keep Google icons, remove Firebase storage
  },
}

module.exports = nextConfig