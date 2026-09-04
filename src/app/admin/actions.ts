'use server';

/**
 * Las acciones del panel.
 *
 * Todas empiezan por la misma pregunta —¿hay sesión válida?— y ninguna la puede
 * saltar, porque el guardián está en la primera línea de cada una y no en un
 * componente que alguien pueda olvidarse de envolver. Un panel donde la
 * autorización vive en la interfaz es un panel sin autorización: la interfaz no
 * es lo que se llama desde fuera.
 */

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  readClientForm,
  readWorkForm,
} from '@/modules/portfolio/application/portfolio-forms';
import { validateClient, validateWork, type Client, type Work } from '@/modules/portfolio/domain/portfolio';
import { services } from '@/shared/infrastructure/config/service-registry';
import {
  ADMIN_COOKIE,
  isAdminEnabled,
  isSecureRequest,
  issueSession,
  sessionCookieOptions,
  verifyPassword,
} from '@/shared/infrastructure/http/admin-session';
import { createRateLimiter } from '@/shared/infrastructure/http/rate-limit';
import { storeMedia } from '@/shared/infrastructure/store/media-store';

import { requirePanel } from './queries';

const ADMIN_PATH = '/admin';

/**
 * Cinco intentos por minuto **y por origen**.
 *
 * La primera versión contaba con una clave constante, y eso convertía la
 * protección en un arma: cualquiera que fallara cinco veces dejaba fuera también
 * al dueño durante el minuto siguiente. Una defensa contra fuerza bruta que
 * produce una denegación de servicio no es una defensa.
 *
 * No protege contra un ataque distribuido —para eso está la longitud mínima de
 * la clave y la comparación en tiempo constante— pero sí contra el guion que
 * prueba el diccionario entero desde una máquina.
 */
const signInLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

/**
 * El origen de la petición. `x-forwarded-for` la escribe el proxy de delante; si
 * no hay proxy no existe y todo cae en la misma cubeta, que es el comportamiento
 * correcto cuando no se puede distinguir a nadie.
 */
async function originKey(): Promise<string> {
  const bag = await headers();
  const forwarded = bag.get('x-forwarded-for');
  return forwarded === null ? 'sin-origen' : (forwarded.split(',')[0]?.trim() ?? 'sin-origen');
}

/**
 * Los errores viajan por la URL y no por estado de React. Es lo que hace que el
 * panel entero funcione sin JavaScript: son formularios HTML que envían y
 * redirigen, igual que el resto del sitio.
 */
export async function signIn(form: FormData): Promise<void> {
  if (!isAdminEnabled()) redirect('/');
  if (!signInLimiter.check(await originKey(), Date.now()).allowed) {
    redirect(`${ADMIN_PATH}?entrar=1&error=throttled`);
  }

  const candidate = form.get('clave');
  if (typeof candidate !== 'string' || !verifyPassword(candidate)) {
    redirect(`${ADMIN_PATH}?entrar=1&error=invalid`);
  }

  const jar = await cookies();
  const secure = isSecureRequest((await headers()).get('host'));
  jar.set(ADMIN_COOKIE, issueSession(Date.now()), sessionCookieOptions(secure));
  redirect(ADMIN_PATH);
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect(ADMIN_PATH);
}

/**
 * La captura es opcional: sin archivo nuevo se conserva la que ya estaba. Un
 * formato rechazado no rompe el guardado — devuelve `null` y quien llama redirige
 * con el error, que es lo que la persona necesita ver.
 */
function currentValue(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value : '';
}

async function resolveUpload(form: FormData, field: string, current: string): Promise<string | null> {
  const file = form.get(field);
  if (!(file instanceof File) || file.size === 0) return current;
  try {
    return await storeMedia(file);
  } catch {
    return null;
  }
}

function refresh(): void {
  revalidatePath('/');
  revalidatePath(ADMIN_PATH);
}

export async function saveWork(id: string, form: FormData): Promise<void> {
  await requirePanel();
  const now = new Date().toISOString();
  const uploaded = await resolveUpload(form, 'cover', currentValue(form, 'coverUrl'));
  if (uploaded === null) redirect(`${ADMIN_PATH}/trabajo/${id}?error=upload`);
  form.set('coverUrl', uploaded);

  const tour = await resolveUpload(form, 'tour', currentValue(form, 'tourUrl'));
  if (tour === null) redirect(`${ADMIN_PATH}/trabajo/${id}?error=upload`);
  form.set('tourUrl', tour);

  const work: Work = readWorkForm({ form, id, now });
  if (validateWork(work).length > 0) redirect(`${ADMIN_PATH}/trabajo/${id}?error=invalid`);

  await services.portfolio.saveWork(work);
  refresh();
  redirect(ADMIN_PATH);
}

export async function saveClient(id: string, form: FormData): Promise<void> {
  await requirePanel();
  const now = new Date().toISOString();
  const uploaded = await resolveUpload(form, 'logo', currentValue(form, 'logoUrl'));
  if (uploaded === null) redirect(`${ADMIN_PATH}/cliente/${id}?error=upload`);
  form.set('logoUrl', uploaded);

  const client: Client = readClientForm({ form, id, now });
  if (validateClient(client).length > 0) redirect(`${ADMIN_PATH}/cliente/${id}?error=invalid`);

  await services.portfolio.saveClient(client);
  refresh();
  redirect(ADMIN_PATH);
}

export async function removeWork(id: string): Promise<void> {
  await requirePanel();
  await services.portfolio.removeWork(id);
  refresh();
  redirect(ADMIN_PATH);
}

export async function removeClient(id: string): Promise<void> {
  await requirePanel();
  await services.portfolio.removeClient(id);
  refresh();
  redirect(ADMIN_PATH);
}

/**
 * Publicar y despublicar es un botón y no un menú: es la acción que más se va a
 * usar, y esconderla dentro del formulario de edición obliga a abrir, cambiar y
 * guardar para algo que debería costar un clic.
 */
export async function toggleWork(id: string): Promise<void> {
  await requirePanel();
  const current = await services.portfolio.findWork(id);
  if (current === null) redirect(ADMIN_PATH);
  const next: Work = { ...current, status: current.status === 'published' ? 'draft' : 'published' };
  await services.portfolio.saveWork(next);
  refresh();
  redirect(ADMIN_PATH);
}

export async function toggleClient(id: string): Promise<void> {
  await requirePanel();
  const current = await services.portfolio.findClient(id);
  if (current === null) redirect(ADMIN_PATH);
  const next: Client = {
    ...current,
    status: current.status === 'published' ? 'draft' : 'published',
  };
  await services.portfolio.saveClient(next);
  refresh();
  redirect(ADMIN_PATH);
}
