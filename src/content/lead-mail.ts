/**
 * El aviso interno que llega cuando alguien llena el formulario.
 *
 * Es texto de cara a una persona, así que vive acá y no dentro del caso de uso
 * (`CLAUDE.md` §2). Son rótulos sueltos y no una plantilla con huecos porque
 * `content/` no puede importar nada —ni siquiera el tipo `Lead`— sin dejar de
 * ser contenido: quien arma el cuerpo es la capa de aplicación.
 *
 * Va en texto plano a propósito. Se lee en el celular, entre otras cosas, y lo
 * único que tiene que pasar al abrirlo es entender en dos segundos quién
 * escribió y por dónde contestarle.
 */

export const LEAD_MAIL = {
  subjectPrefix: 'Nuevo contacto desde la página',
  intro: 'Alguien llenó el formulario del sitio. Esto es lo que dejó:',
  labels: {
    name: 'Nombre',
    business: 'Negocio',
    email: 'Correo',
    whatsapp: 'WhatsApp',
    interest: 'Qué le interesa',
    message: 'Qué se le complica hoy',
    receivedAt: 'Recibido',
  },
  /** Lo que se imprime donde el visitante no llenó nada. */
  missing: 'no lo dejó',
  closing: 'Le prometimos respuesta el mismo día hábil.',
} as const;
