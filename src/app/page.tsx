import { NavBar } from '@/components/layout/nav-bar';
import { SiteFooter } from '@/components/layout/site-footer';
import { Contact } from '@/components/sections/contact';
import { Hero } from '@/components/sections/hero';
import { Marquee } from '@/components/sections/marquee';
import { Process } from '@/components/sections/process';
import { Products } from '@/components/sections/products';
import { Questions } from '@/components/sections/questions';
import { Quote } from '@/components/sections/quote';
import { Services } from '@/components/sections/services';
import { Works } from '@/components/sections/works';

/**
 * La página, en el orden exacto del prototipo (`SPEC.md` §6).
 *
 * Solo composición: ni un texto, ni una clase visual, ni una decisión. Cada
 * sección sabe cómo se pinta y saca su contenido de `content/`.
 *
 * `Quote` puede devolver nada: el testimonio no se publica hasta tener el
 * nombre real (C2).
 */
export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Marquee />
        <Products />
        <Works />
        <Services />
        <Process />
        <Quote />
        <Questions />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
