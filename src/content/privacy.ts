/**
 * El aviso de privacidad.
 *
 * El pie enlazaba a `/privacidad` desde P11 y esa ruta no existía: daba 404. En
 * un sitio que pide nombre, correo y WhatsApp en un formulario, ese enlace roto
 * no era un enlace roto cualquiera — era el aviso que la LOPDP exige, sin
 * cumplir (`CLAUDE.md` §4).
 *
 * El texto dice solo lo que el sitio hace hoy. **No promete tratamientos que no
 * existen**: hoy no hay bot, no hay agendamiento conectado y no hay correo real,
 * así que no se nombran. Cuando P6, P8 y P9 entren, este archivo se amplía en el
 * mismo paquete que los enciende.
 *
 * El plazo y la vía de borrado son concretos a propósito. Un aviso que dice
 * «conservamos sus datos el tiempo necesario» no informa de nada.
 */

export interface PrivacySection {
  readonly id: string;
  readonly title: string;
  readonly body: readonly string[];
}

export const PRIVACY = {
  title: 'Aviso de privacidad',
  updated: 'Actualizado en septiembre de 2026',
  intro:
    'Este aviso explica qué datos suyos recoge este sitio, para qué los usamos, cuánto tiempo los guardamos y cómo pedir que los borremos.',
  sections: [
    {
      id: 'responsable',
      title: 'Quién trata sus datos',
      body: [
        'Noctis, con operación en Loja, Ecuador. Somos un equipo pequeño y sus datos los ve solo quien atiende su consulta.',
        'Para cualquier asunto relacionado con este aviso puede escribirnos por los canales del pie de página.',
      ],
    },
    {
      id: 'que-recogemos',
      title: 'Qué datos recogemos',
      body: [
        'Únicamente los que usted escribe en el formulario de contacto: nombre, nombre del negocio, correo, WhatsApp, el asunto que le interesa y el mensaje.',
        'Ninguno de esos campos es obligatorio salvo un canal por el que responderle. Si no deja un canal válido, no le podemos contestar y no guardamos el envío.',
        'El sitio no usa cookies de publicidad ni de seguimiento, y no hay analítica de terceros. La única preferencia que se guarda en su navegador es si eligió modo claro u oscuro, y esa preferencia no sale de su equipo.',
      ],
    },
    {
      id: 'para-que',
      title: 'Para qué los usamos',
      body: [
        'Para responderle y, si hay interés, para preparar una propuesta. Nada más.',
        'No vendemos, alquilamos ni cedemos sus datos a terceros, y no los usamos para enviarle publicidad que no haya pedido.',
      ],
    },
    {
      id: 'cuanto-tiempo',
      title: 'Cuánto tiempo los guardamos',
      body: [
        'Doce meses desde su último mensaje. Cumplido el plazo, el registro se borra.',
        'Si de la conversación sale un contrato, los datos de ese contrato se conservan el tiempo que exige la normativa contable y tributaria ecuatoriana, y solo esos.',
      ],
    },
    {
      id: 'sus-derechos',
      title: 'Sus derechos',
      body: [
        'Puede pedirnos en cualquier momento que le digamos qué datos suyos tenemos, que los corrijamos si están mal, o que los borremos.',
        'Escríbanos por cualquiera de los canales del pie con el asunto «datos personales». Respondemos en un máximo de quince días hábiles, y el borrado es real: se elimina el registro, no se marca como oculto.',
      ],
    },
    {
      id: 'seguridad',
      title: 'Cómo los protegemos',
      body: [
        'El sitio va cifrado de punta a punta y el acceso a los mensajes está restringido al equipo.',
        'Nuestros registros técnicos no guardan datos personales: sirven para saber si algo falló, no para saber quién escribió.',
      ],
    },
  ] as const satisfies readonly PrivacySection[],
  backLabel: 'Volver al inicio',
  backHref: '/',
} as const;
