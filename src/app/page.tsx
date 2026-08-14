import { SITE } from '@/content/site';

/**
 * Portada del esqueleto. P1 trae el sistema de diseño y P2 las once secciones
 * del prototipo; acá solo hay lo necesario para que la aplicación levante y se
 * pueda comprobar que arranca sin una sola credencial.
 */
export default function HomePage() {
  return (
    <main>
      <h1>{SITE.name}</h1>
    </main>
  );
}
