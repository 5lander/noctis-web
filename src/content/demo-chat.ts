/**
 * El guion del bot simulado.
 *
 * Es una conversación determinista, siempre la misma: saludo, negocio, problema,
 * interés, contacto y cierre (`BUILD.md` §3). Para mostrarle el sistema a un
 * cliente esto es **mejor** que el modelo real, porque no improvisa.
 *
 * Cumple las reglas del bot por construcción, no por suerte:
 * **no da precios ni plazos cerrados** (RN5) y **no afirma que un producto esté
 * disponible** (RN6): deriva a proforma y a conversación.
 *
 * El guion definitivo lo revisa el usuario en P8 (B5 de `FASE0-CHECKLIST.md`).
 */

export const DEMO_CHAT_SCRIPT: readonly string[] = [
  'Buenas. Soy el asistente de Noctis. ¿De qué es su negocio?',
  '¿Y qué es lo que más tiempo le quita hoy, en un día normal?',
  'Entiendo. ¿Eso lo lleva alguien del equipo o se resuelve como se puede?',
  'Con eso podemos ayudar. Le paso una proforma con alcance y plazo por escrito, no un número al aire.',
  '¿A qué correo o WhatsApp se la enviamos?',
  'Listo. Alguien del equipo le escribe el mismo día hábil.',
];

/** Lo que se responde cuando la conversación pasó del límite. */
export const DEMO_CHAT_LIMIT =
  'Prefiero que siga con una persona: escríbanos por WhatsApp y le contestamos ahí mismo.';
