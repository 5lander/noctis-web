import { ModeToggle } from '@/components/theme/mode-toggle';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Status } from '@/components/ui/status';
import { DESIGN_SYSTEM_PREVIEW as PREVIEW } from '@/content/design-system-preview';
import { UI_TEXT } from '@/content/ui';

import styles from './page.module.css';

/**
 * Vista del sistema de diseño de P1: los tokens y los cinco componentes base,
 * para poder comprobar los dos modos y el contraste de un vistazo.
 *
 * **P2 la reemplaza** por las once secciones del prototipo y borra
 * `content/design-system-preview.ts` con ella.
 */

function Buttons() {
  return (
    <section className={styles['block']}>
      <Label>{PREVIEW.sections.buttons}</Label>
      <div className={styles['row']}>
        <Button href="#trabajos">{PREVIEW.buttons.solid}</Button>
        <Button variant="outline" href="#contacto">
          {PREVIEW.buttons.outline}
        </Button>
      </div>
    </section>
  );
}

function LabelsAndStatuses() {
  return (
    <section className={styles['block']}>
      <Label>{PREVIEW.sections.labels}</Label>
      <div className={styles['row']}>
        <Label>{PREVIEW.label}</Label>
        <Status available>{PREVIEW.statuses.available}</Status>
        <Status>{PREVIEW.statuses.inProgress}</Status>
      </div>
    </section>
  );
}

function Fields() {
  return (
    <section className={styles['block']}>
      <Label>{PREVIEW.sections.field}</Label>
      <div className={styles['form']}>
        <Field htmlFor="preview-nombre" label={PREVIEW.field.label}>
          <input
            id="preview-nombre"
            name="nombre"
            type="text"
            placeholder={PREVIEW.field.placeholder}
          />
        </Field>
      </div>
    </section>
  );
}

function InvertedBand() {
  return (
    <section className={`inv ${styles['inverted']}`}>
      <Label>{PREVIEW.sections.inverted}</Label>
      <p>{PREVIEW.invertedNote}</p>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className={styles['page']}>
      <header className={styles['header']}>
        <h1>{PREVIEW.title}</h1>
        <ModeToggle label={UI_TEXT.modeToggle} />
      </header>

      <p className={styles['intro']}>{PREVIEW.intro}</p>

      <Buttons />
      <LabelsAndStatuses />
      <Fields />

      <section className={styles['block']}>
        <Label>{PREVIEW.sections.questions}</Label>
        <Accordion items={PREVIEW.questions} />
      </section>

      <InvertedBand />
    </main>
  );
}
