import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // 配置 transpile packages
  transpilePackages: ['@smart-wallet/core'],
  
  // 实验性功能
  experimental: {
    // 其他实验性功能可以在这里添加
  },
};

export default nextConfig;
