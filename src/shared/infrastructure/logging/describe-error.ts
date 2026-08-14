/**
 * Convierte un `unknown` capturado en algo registrable.
 *
 * Existe porque `catch` entrega `unknown` y la regla de tipado prohíbe `any`:
 * el estrechamiento se hace una vez, acá, y no en cada handler. Devuelve nombre
 * y mensaje del error, nunca la traza: la traza no sale al cliente
 * (SEGURIDAD.md §8) y en el registro no aporta más que ruido.
 */

const UNKNOWN_ERROR_NAME = 'ErrorDesconocido';

// Alias y no interfaz a propósito: un alias de objeto literal recibe firma de
// índice implícita y por eso encaja en los campos del registro sin conversiones.
export type DescribedError = {
  readonly errorName: string;
  readonly errorMessage: string;
};

export function describeError(error: unknown): DescribedError {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message };
  }
  return { errorName: UNKNOWN_ERROR_NAME, errorMessage: String(error) };
}
