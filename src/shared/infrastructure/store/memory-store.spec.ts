import { describe, expect, it } from 'vitest';

import { MemoryStore } from './memory-store';

interface Lead {
  readonly name: string;
}

describe('almacén en memoria', () => {
  it('guarda y devuelve lo guardado', async () => {
    const store = new MemoryStore<Lead>();
    await store.save('lead-1', { name: 'Ana' });

    expect(await store.read('lead-1')).toEqual({ name: 'Ana' });
  });

  it('devuelve null si no está, en vez de lanzar', async () => {
    expect(await new MemoryStore<Lead>().read('no-existe')).toBeNull();
  });

  it('sobrescribe con el mismo identificador', async () => {
    const store = new MemoryStore<Lead>();
    await store.save('lead-1', { name: 'Ana' });
    await store.save('lead-1', { name: 'Ana Pérez' });

    expect(await store.read('lead-1')).toEqual({ name: 'Ana Pérez' });
    expect(store.size()).toBe(1);
  });

  it('borra de verdad: es la vía de borrado que exige LOPDP', async () => {
    const store = new MemoryStore<Lead>();
    await store.save('lead-1', { name: 'Ana' });
    await store.remove('lead-1');

    expect(await store.read('lead-1')).toBeNull();
    expect(store.size()).toBe(0);
  });

  it('borrar algo que no está no falla', async () => {
    await expect(new MemoryStore<Lead>().remove('no-existe')).resolves.toBeUndefined();
  });
});
