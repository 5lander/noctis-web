import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // SEGURIDAD.md §8: sin banners de versión en las respuestas.
  poweredByHeader: false,
  // Que el build no ignore un error de tipos: la compuerta de calidad es
  // `npm run audit:fast`, pero ninguna otra debe poder saltarse en silencio.
  // (El linting ya no se configura acá: Next 16 quitó `next lint`, y `eslint`
  // corre por su propio script.)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
