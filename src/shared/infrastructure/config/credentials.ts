/**
 * RN10, la regla más cara de romper: con un servicio en `real`, **si falta una
 * credencial la aplicación no arranca y dice cuál falta. Jamás cae a simulado en
 * silencio.**
 *
 * Un despliegue que se queda en simulado sin avisar es un desastre invisible: el
 * sitio funciona, el prospecto agenda, y la reunión no existe en ningún
 * calendario. Por eso la comprobación es al arrancar y aborta, en vez de un aviso
 * en un registro que nadie mira.
 *
 * Acá solo están los **nombres**. Los valores se leen en P12, cuando se conecte
 * cada servicio; lo que P4 garantiza es que sin ellos no se arranca.
 */

const REQUIRED_CREDENTIALS = {
  calendar: ['GOOGLE_CALENDAR_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'],
  mail: ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL'],
  chat: ['MODELO_API_KEY', 'MODELO_NOMBRE', 'MODELO_TOPE_MENSUAL_USD'],
  store: ['DATABASE_URL'],
} as const satisfies Record<string, readonly string[]>;

export type ServiceName = keyof typeof REQUIRED_CREDENTIALS;

class MissingCredentialsError extends Error {
  constructor(service: ServiceName, missing: readonly string[]) {
    super(
      `El servicio "${service}" está configurado en modo real y faltan estas variables: ` +
        `${missing.join(', ')}. La aplicación no arranca en simulado sin avisar (RN10).`,
    );
    this.name = 'MissingCredentialsError';
  }
}

function isMissing(source: Record<string, string | undefined>, name: string): boolean {
  const value = source[name];
  return value === undefined || value.trim() === '';
}

/**
 * Devuelve las credenciales ausentes de un servicio. No lanza: quien compone
 * decide si eso aborta el arranque, y así esta función se puede probar sola.
 */
function missingCredentialsFor(
  service: ServiceName,
  source: Record<string, string | undefined>,
): readonly string[] {
  return REQUIRED_CREDENTIALS[service].filter((name) => isMissing(source, name));
}

export function assertCredentialsFor(
  service: ServiceName,
  source: Record<string, string | undefined>,
): void {
  const missing = missingCredentialsFor(service, source);
  if (missing.length > 0) throw new MissingCredentialsError(service, missing);
}
