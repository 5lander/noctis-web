/**
 * Latencia y fallos simulados, comunes a los cuatro adaptadores.
 *
 * El fallo es **un interruptor, no un dado**. Un adaptador que falla al azar
 * vuelve las pruebas intermitentes y las demostraciones impredecibles, que es lo
 * contrario de lo que se busca: `BUILD.md` §3 dice que para mostrarle algo a un
 * cliente lo simulado es *mejor* que lo real justamente porque siempre hace lo
 * mismo.
 *
 * La latencia existe para que la interfaz se construya contra un servicio que
 * tarda. Un adaptador instantáneo esconde los estados de carga hasta que es
 * tarde.
 */

type FakeFault = 'none' | 'unavailable';

export interface FakeBehaviour {
  readonly latencyMs: number;
  readonly fault: FakeFault;
}

/** Para pruebas: sin espera y sin fallo. */
export const HEALTHY_AND_INSTANT: FakeBehaviour = { latencyMs: 0, fault: 'none' };

/** Para desarrollo y demostración: se siente como un servicio real. */
const DEMO_LATENCY_MS = 220;
export const HEALTHY_WITH_LATENCY: FakeBehaviour = {
  latencyMs: DEMO_LATENCY_MS,
  fault: 'none',
};

class SimulatedServiceError extends Error {
  constructor(service: string) {
    super(`El servicio simulado "${service}" está configurado como no disponible`);
    this.name = 'SimulatedServiceError';
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function applyBehaviour(behaviour: FakeBehaviour, service: string): Promise<void> {
  if (behaviour.latencyMs > 0) await delay(behaviour.latencyMs);
  if (behaviour.fault === 'unavailable') throw new SimulatedServiceError(service);
}
