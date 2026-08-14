import { Section } from '@/components/layout/section';
import { Label } from '@/components/ui/label';
import { PROCESS_STEPS } from '@/content/process';
import { HEADINGS } from '@/content/site-copy';

import styles from './process.module.css';

export function Process() {
  return (
    <Section id="proceso" heading={HEADINGS.process}>
      <div className={styles['grid']}>
        {PROCESS_STEPS.map((step) => (
          <div key={step.id} className={styles['step']} data-anim>
            <Label>{step.stage}</Label>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
