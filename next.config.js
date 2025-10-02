/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', 'themunchclub.com', 'res.cloudinary.com', 'images.unsplash.com'],
    },
    allowedDevOrigins: [
        '13.53.44.1',
        'localhost',
        '127.0.0.1'
    ],
}

module.exports = nextConfig

