/** @type {import('next').NextConfig} */
const backendApiUrl=(process.env.BACKEND_API_URL||'http://localhost:4000').replace(/\/$/,'');
const nextConfig={reactStrictMode:true,async rewrites(){return[{source:'/api/:path*',destination:`${backendApiUrl}/api/:path*`}];}};
export default nextConfig;
