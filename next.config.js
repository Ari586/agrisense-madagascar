const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

module.exports = {
  reactStrictMode: true,
  ...(isCapacitorBuild
    ? {
        output: 'export',
        distDir: 'www',
        images: {
          unoptimized: true,
        },
        pageExtensions: ['tsx'],
      }
    : {
        output: 'standalone',
        outputFileTracingRoot: process.cwd(),
        turbopack: {
          root: process.cwd(),
        },
        async rewrites() {
          return [
            {
              source: '/app',
              destination: '/app/index.html',
            },
            {
              source: '/app/:path*',
              destination: '/app/index.html',
            },
          ];
        },
      }),
};
