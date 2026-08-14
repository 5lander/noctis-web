/**
 * Regla de dependencia de CLAUDE.md §2, hecha ejecutable.
 *
 *   infrastructure  →  application  →  domain
 *
 * Esto no es documentación: `audit:arch` corre en `audit:fast`, que bloquea el
 * commit. Un import de infraestructura desde el dominio rompe la compuerta, que
 * es exactamente el criterio de aceptación de P0.
 */

const DOMAIN = '^src/(modules/[^/]+|shared)/domain/';
const APPLICATION = '^src/(modules/[^/]+|shared)/application/';
const INFRASTRUCTURE = '^src/(modules/[^/]+|shared)/infrastructure/';
const CONTENT = '^src/content/';

module.exports = {
  forbidden: [
    {
      name: 'dominio-solo-dominio',
      severity: 'error',
      comment:
        'El dominio no sabe que existe la infraestructura. Solo puede importar otros ' +
        'archivos de domain: ni Next, ni React, ni SDKs, ni HTTP, ni módulos de Node. ' +
        'Si una regla necesita salir a buscar algo, está en la capa equivocada.',
      from: { path: DOMAIN },
      to: { pathNot: DOMAIN },
    },
    {
      name: 'aplicacion-sin-infraestructura',
      severity: 'error',
      comment:
        'Los casos de uso hablan con puertos, no con implementaciones. Reciben sus ' +
        'adaptadores por constructor (CLAUDE.md §2).',
      from: { path: APPLICATION },
      to: { path: `${INFRASTRUCTURE}|^src/app/|^src/components/` },
    },
    {
      name: 'contenido-es-hoja',
      severity: 'error',
      comment:
        '`content/` es la fuente única de los textos del sitio y no depende de nadie. ' +
        'Si importa algo, dejó de ser contenido y pasó a ser lógica.',
      from: { path: CONTENT },
      to: { pathNot: CONTENT },
    },
    {
      name: 'sin-ciclos',
      severity: 'error',
      comment: 'Un ciclo de imports es una capa mal cortada.',
      from: {},
      to: { circular: true },
    },
  ],

  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.spec\\.tsx?$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
