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
      }),
};
