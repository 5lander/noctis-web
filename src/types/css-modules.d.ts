/**
 * Tipos de los módulos CSS.
 *
 * Next los declara en `next-env.d.ts`, que es un archivo generado y por lo tanto
 * no versionado: sin esto, `tsc --noEmit` falla en un clon limpio antes de que
 * exista un build. La declaración es la misma, y es nuestra.
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
