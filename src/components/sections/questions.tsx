import { Section } from '@/components/layout/section';
import { Accordion } from '@/components/ui/accordion';
import { QUESTIONS } from '@/content/questions';
import { HEADINGS } from '@/content/site-copy';

/**
 * Las cuatro preguntas. El acordeón es el de `components/ui`: acá solo se le
 * pasan las preguntas de `content/`.
 */
export function Questions() {
  return (
    <Section id="preguntas" heading={HEADINGS.questions}>
      <Accordion items={QUESTIONS} />
    </Section>
  );
}
