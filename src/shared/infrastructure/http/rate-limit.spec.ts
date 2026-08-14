import { describe, expect, it } from 'vitest';

import { createRateLimiter } from './rate-limit';

const RULE = { limit: 3, windowMs: 60_000 } as const;
const START = 1_000_000;

describe('limitador de peticiones', () => {
  it('deja pasar hasta el límite y descuenta lo que queda', () => {
    const limiter = createRateLimiter(RULE);

    expect(limiter.check('ip-a', START)).toMatchObject({ allowed: true, remaining: 2 });
    expect(limiter.check('ip-a', START)).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check('ip-a', START)).toMatchObject({ allowed: true, remaining: 0 });
  });

  it('corta al pasarse y dice cuánto esperar', () => {
    const limiter = createRateLimiter(RULE);
    for (let i = 0; i < RULE.limit; i += 1) limiter.check('ip-a', START);

    const verdict = limiter.check('ip-a', START + 10_000);

    expect(verdict.allowed).toBe(false);
    expect(verdict.remaining).toBe(0);
    expect(verdict.retryAfterSeconds).toBe(50);
  });

  it('nunca dice que espere cero segundos cuando bloquea', () => {
    const limiter = createRateLimiter(RULE);
    for (let i = 0; i < RULE.limit; i += 1) limiter.check('ip-a', START);

    expect(limiter.check('ip-a', START + RULE.windowMs - 1).retryAfterSeconds).toBe(1);
  });

  it('se recupera cuando la ventana termina', () => {
    const limiter = createRateLimiter(RULE);
    for (let i = 0; i < RULE.limit + 2; i += 1) limiter.check('ip-a', START);

    expect(limiter.check('ip-a', START + RULE.windowMs)).toMatchObject({
      allowed: true,
      remaining: RULE.limit - 1,
    });
  });

  it('cuenta cada origen por separado: uno abusivo no bloquea al resto', () => {
    const limiter = createRateLimiter(RULE);
    for (let i = 0; i < RULE.limit + 1; i += 1) limiter.check('ip-abusiva', START);

    expect(limiter.check('ip-tranquila', START).allowed).toBe(true);
  });

  it('el límite de una ventana no se hereda a la siguiente', () => {
    const limiter = createRateLimiter(RULE);
    limiter.check('ip-a', START);
    limiter.check('ip-a', START + RULE.windowMs);

    expect(limiter.check('ip-a', START + RULE.windowMs).remaining).toBe(1);
  });
});
