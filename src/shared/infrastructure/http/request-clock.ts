/**
 * El instante en que el servidor atendió esta petición.
 *
 * Existe como función aparte por una regla de React que conviene entender antes
 * de moverla: **un componente no puede llamar a algo impuro mientras renderiza**.
 * `Date.now()` escrito dentro del JSX devuelve un valor distinto en cada
 * re-render, y el linter lo rechaza con razón —no distingue, ni tiene por qué,
 * entre un componente de servidor que se pinta una vez por petición y uno de
 * cliente que se pinta muchas veces.
 *
 * La forma correcta es la de siempre con los datos: se obtienen una vez, arriba,
 * y bajan como propiedad. Acá se obtiene, y `page.tsx` lo pasa hacia abajo como
 * cualquier otro dato de la petición.
 *
 * Es `async` porque quien la llama es un componente de servidor asíncrono y así
 * queda dentro de su fase de datos, no de su fase de pintado.
 */
export async function requestStartedAt(): Promise<number> {
  return Promise.resolve(Date.now());
}
