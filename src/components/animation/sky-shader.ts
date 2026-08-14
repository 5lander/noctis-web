/**
 * El cielo de medianoche de la portada (RA-07), en GLSL.
 *
 * Es un solo cuadrilátero que ocupa la pantalla: no hay geometría, no hay luces
 * y no hay modelos. Todo lo que se ve —la nebulosa, el polvo de estrellas, el
 * halo que sigue al puntero— sale de esta función de fragmento, así que el costo
 * es de píxeles y no de vértices, y baja solo cuando baja la densidad de píxeles.
 *
 * Los tres colores llegan como uniformes desde `brand-colors.ts`, que los lee de
 * `tokens.css`. Acá no hay ni un color escrito: el shader no sabe qué es índigo.
 *
 * El ruido es un `fbm` clásico de cinco octavas sobre `value noise`. Se eligió
 * ese y no `simplex` porque cabe en veinte líneas y a esta escala no se
 * distingue: la nebulosa está desenfocada por definición.
 */

export const SKY_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const SKY_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec3 uBackground;
  uniform vec3 uBrand;
  uniform vec3 uAccent;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 inner = fract(p);
    vec2 smoothed = inner * inner * (3.0 - 2.0 * inner);

    float bottomLeft = hash(cell);
    float bottomRight = hash(cell + vec2(1.0, 0.0));
    float topLeft = hash(cell + vec2(0.0, 1.0));
    float topRight = hash(cell + vec2(1.0, 1.0));

    return mix(
      mix(bottomLeft, bottomRight, smoothed.x),
      mix(topLeft, topRight, smoothed.x),
      smoothed.y
    );
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 5; octave++) {
      total += amplitude * valueNoise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }

    return total;
  }

  /* Polvo de estrellas: puntos duros sobre una rejilla, con parpadeo desfasado. */
  float starField(vec2 uv, float density, float twinkle) {
    vec2 cell = floor(uv * density);
    vec2 inner = fract(uv * density) - 0.5;

    float seed = hash(cell);
    float present = step(0.985, seed);
    float distance = length(inner - (vec2(hash(cell + 1.0), hash(cell + 2.0)) - 0.5) * 0.6);
    float pulse = 0.65 + 0.35 * sin(uTime * twinkle + seed * 30.0);

    return present * pulse * smoothstep(0.06, 0.0, distance);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = (vUv - 0.5) * aspect;
    vec2 pointer = uPointer * aspect;

    /* La nebulosa se arrastra despacio y se deforma consigo misma. */
    vec2 drift = vec2(uTime * 0.08, uTime * 0.03);
    float warp = fbm(uv * 1.6 + drift);
    float clouds = fbm(uv * 2.4 - drift + warp * 0.8);

    /* El halo que sigue al puntero: cerca del cursor la nebulosa se enciende. */
    float halo = smoothstep(0.9, 0.0, length(uv - pointer));

    vec3 color = uBackground;
    color = mix(color, uBrand, clamp(clouds * 0.85, 0.0, 1.0) * 0.55);
    color = mix(color, uAccent, pow(clouds, 3.0) * 0.35 + halo * 0.18);
    color += uAccent * starField(vUv, 90.0, 2.4) * 0.9;
    color += uAccent * starField(vUv, 45.0, 1.1) * 0.5;

    /* Viñeta: el cielo se apaga hacia los bordes para no pelear con el titular. */
    float vignette = smoothstep(1.25, 0.15, length(uv));
    color = mix(uBackground, color, vignette);

    gl_FragColor = vec4(color, uOpacity);
  }
`;
