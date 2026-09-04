/**
 * Las lecturas del panel.
 *
 * Están separadas de `actions.ts` por una razón concreta: **todo lo que se
 * exporta de un archivo `'use server'` se convierte en un punto de entrada HTTP**,
 * llamable desde fuera con una petición armada a mano. Las mutaciones necesitan
 * serlo; una lectura, no. Dejarlas acá reduce la superficie a lo que de verdad
 * tiene que estar expuesto.
 */

import { randomUUID } from 'node:crypto';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { emptyClient, emptyWork } from '@/modules/portfolio/application/portfolio-forms';
import type { Client, Work } from '@/modules/portfolio/domain/portfolio';
import { services } from '@/shared/infrastructure/config/service-registry';
import {
  ADMIN_COOKIE,
  isAdminEnabled,
  isSessionValid,
} from '@/shared/infrastructure/http/admin-session';

const ADMIN_PATH = '/admin';
const NEW = 'nuevo';

export async function hasSession(): Promise<boolean> {
  if (!isAdminEnabled()) return false;
  const jar = await cookies();
  return isSessionValid(jar.get(ADMIN_COOKIE)?.value, Date.now());
}

/** Sin clave configurada el panel no existe: se va al sitio, no a un acceso. */
export async function requirePanel(): Promise<void> {
  if (!isAdminEnabled()) redirect('/');
  if (!(await hasSession())) redirect(`${ADMIN_PATH}?entrar=1`);
}

/**
 * `nuevo` estrena identificador; cualquier otro conserva el suyo aunque todavía
 * no exista en la base. Eso es lo que hace que un guardado rechazado por
 * validación vuelva al mismo formulario y no a uno en blanco con otro id.
 */
export async function loadWork(id: string): Promise<Work> {
  await requirePanel();
  const now = new Date().toISOString();
  if (id === NEW) return emptyWork(randomUUID(), now);
  return (await services.portfolio.findWork(id)) ?? emptyWork(id, now);
}

export async function loadClient(id: string): Promise<Client> {
  await requirePanel();
  const now = new Date().toISOString();
  if (id === NEW) return emptyClient(randomUUID(), now);
  return (await services.portfolio.findClient(id)) ?? emptyClient(id, now);
}

export async function loadWorks(): Promise<readonly Work[]> {
  await requirePanel();
  return services.portfolio.listWorks({});
}

export async function loadClients(): Promise<readonly Client[]> {
  await requirePanel();
  return services.portfolio.listClients({});
}
