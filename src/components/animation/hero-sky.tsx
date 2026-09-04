'use client';

import { useEffect, useRef } from 'react';
import type { IUniform } from 'three';
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import { REDUCED_MOTION_QUERY, SKY } from './animation-settings';
import { readBrandColor, type RgbColor } from './brand-colors';
import { gsap } from './gsap-plugins';
import { SKY_FRAGMENT_SHADER, SKY_VERTEX_SHADER } from './sky-shader';

import styles from './hero-sky.module.css';

/**
 * El cielo de medianoche de la portada (RA-07).
 *
 * Es el único WebGL del sitio y está deliberadamente acotado: un cuadrilátero
 * que cubre la portada, sin geometría ni texturas, con la densidad de píxeles
 * limitada. Se apaga solo cuando la portada sale de pantalla, así que el resto
 * del recorrido no paga nada.
 *
 * Tres condiciones lo dejan fuera sin romper nada, porque el degradado del CSS
 * queda debajo: movimiento reducido, un navegador sin contexto WebGL, y que el
 * paquete no llegue a ejecutarse.
 *
 * Los colores no están acá: se leen de `tokens.css` en tiempo de ejecución y se
 * vuelven a leer cuando cambia el modo (`brand-colors.ts`).
 */

const PALETTE_TOKENS = {
  background: '--color-fondo',
  brand: '--color-marca',
  accent: '--color-acento',
} as const;

const HALF = 0.5;
const CAMERA_BOUNDS = { left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1 } as const;
const QUAD_SIZE = 2;
const MS_PER_SECOND = 1000;

/**
 * La firma de índice es lo que `ShaderMaterial` exige para aceptar el objeto:
 * él recorre los uniformes por nombre. Los siete miembros declarados son los que
 * hacen que el resto del archivo siga estando tipado de verdad.
 */
interface SkyUniforms {
  readonly [name: string]: IUniform;
  readonly uTime: IUniform<number>;
  readonly uOpacity: IUniform<number>;
  readonly uResolution: IUniform<Vector2>;
  readonly uPointer: IUniform<Vector2>;
  readonly uBackground: IUniform<Vector3>;
  readonly uBrand: IUniform<Vector3>;
  readonly uAccent: IUniform<Vector3>;
}

function toVector(color: RgbColor): Vector3 {
  return new Vector3(color.red, color.green, color.blue);
}

/**
 * Los tres colores del cielo se **leen** de los tokens, no se calculan acá: la
 * paleta vive en `tokens.css` y este archivo no es sitio para un hex.
 *
 * Se leen una sola vez, al crear los uniformes. Mientras hubo modo claro había
 * además un `refreshPalette` atado a un `MutationObserver` sobre `data-mode`,
 * porque conmutar cambiaba los tres colores debajo del shader. Con un solo
 * esquema la paleta ya no cambia después del arranque.
 */
function createUniforms(): SkyUniforms {
  return {
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0, 0) },
    uBackground: { value: toVector(readBrandColor(PALETTE_TOKENS.background)) },
    uBrand: { value: toVector(readBrandColor(PALETTE_TOKENS.brand)) },
    uAccent: { value: toVector(readBrandColor(PALETTE_TOKENS.accent)) },
  };
}

/** Devuelve `null` si el navegador no da contexto: es un caso previsto, no un error. */
function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SKY.maxPixelRatio));
    return renderer;
  } catch {
    // Sin WebGL queda el degradado del CSS, que es el mismo cielo sin movimiento.
    return null;
  }
}

function createMesh(uniforms: SkyUniforms): Mesh {
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: SKY_VERTEX_SHADER,
    fragmentShader: SKY_FRAGMENT_SHADER,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  return new Mesh(new PlaneGeometry(QUAD_SIZE, QUAD_SIZE), material);
}

function resizeTo(renderer: WebGLRenderer, uniforms: SkyUniforms, canvas: HTMLCanvasElement): void {
  const { clientWidth, clientHeight } = canvas;
  if (clientWidth === 0 || clientHeight === 0) return;

  renderer.setSize(clientWidth, clientHeight, false);
  uniforms.uResolution.value.set(clientWidth, clientHeight);
}

interface SkyRuntime {
  readonly renderer: WebGLRenderer;
  readonly uniforms: SkyUniforms;
  readonly canvas: HTMLCanvasElement;
}

/** El puntero se persigue con suavizado propio: es una sola interpolación por cuadro. */
function trackPointer(uniforms: SkyUniforms): () => void {
  const target = new Vector2(0, 0);

  const onPointerMove = (event: PointerEvent): void => {
    target.set(
      (event.clientX / window.innerWidth - HALF) * SKY.pointerStrength,
      (HALF - event.clientY / window.innerHeight) * SKY.pointerStrength,
    );
  };

  const follow = (): void => {
    uniforms.uPointer.value.lerp(target, SKY.pointerEase);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  gsap.ticker.add(follow);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    gsap.ticker.remove(follow);
  };
}

/** Fuera de pantalla no se dibuja: la portada es lo único que este cielo cubre. */
function renderWhileVisible({ renderer, uniforms, canvas }: SkyRuntime, scene: Scene, camera: OrthographicCamera): () => void {
  let visible = true;

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  observer.observe(canvas);

  const update = (_time: number, deltaMs: number): void => {
    if (!visible) return;
    uniforms.uTime.value += (deltaMs / MS_PER_SECOND) * SKY.timeScale;
    renderer.render(scene, camera);
  };

  gsap.ticker.add(update);

  return () => {
    observer.disconnect();
    gsap.ticker.remove(update);
  };
}

function startSky(canvas: HTMLCanvasElement): () => void {
  const uniforms = createUniforms();
  const renderer = createRenderer(canvas);
  if (renderer === null) return () => undefined;

  const scene = new Scene();
  const mesh = createMesh(uniforms);
  scene.add(mesh);

  const camera = new OrthographicCamera(
    CAMERA_BOUNDS.left,
    CAMERA_BOUNDS.right,
    CAMERA_BOUNDS.top,
    CAMERA_BOUNDS.bottom,
    CAMERA_BOUNDS.near,
    CAMERA_BOUNDS.far,
  );

  const runtime: SkyRuntime = { renderer, uniforms, canvas };
  const stopPointer = trackPointer(uniforms);
  const stopRendering = renderWhileVisible(runtime, scene, camera);
  const stopWatching = watchViewport(runtime);

  gsap.to(uniforms.uOpacity, { value: 1, duration: SKY.fadeInSeconds, ease: 'none' });

  return () => {
    stopPointer();
    stopRendering();
    stopWatching();
    renderer.dispose();
    mesh.geometry.dispose();
  };
}

/**
 * El tamaño cambia sin avisar e invalida lo dibujado.
 *
 * Antes también vigilaba `data-mode` con un `MutationObserver`, porque el cielo
 * lee sus tres colores de los tokens y había que releerlos al conmutar. Con un
 * solo esquema la paleta no cambia nunca después del arranque, así que la
 * lectura inicial de `refreshPalette` es la única que hace falta.
 */
function watchViewport({ renderer, uniforms, canvas }: SkyRuntime): () => void {
  resizeTo(renderer, uniforms, canvas);

  const sizeObserver = new ResizeObserver(() => {
    resizeTo(renderer, uniforms, canvas);
  });
  sizeObserver.observe(canvas);

  return () => {
    sizeObserver.disconnect();
  };
}

export function HeroSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return undefined;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    return startSky(canvas);
  }, []);

  return (
    <div className={styles['sky']} aria-hidden="true">
      {/*
        Decorativo y nada más: el argumento de la portada está en el titular y en
        la bajada. Sin `aria-hidden`, un lector de pantalla anuncia un lienzo
        vacío antes del `h1`, que es la primera cosa que oye quien entra.
      */}
      <canvas className={styles['canvas']} ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
