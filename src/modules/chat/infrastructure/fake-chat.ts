import type { ChatPort, ChatReply, ChatTurn } from '@/modules/chat/application/ports/chat-port';
import { DEMO_CHAT_LIMIT, DEMO_CHAT_SCRIPT } from '@/content/demo-chat';
import {
  applyBehaviour,
  HEALTHY_WITH_LATENCY,
  type FakeBehaviour,
} from '@/shared/infrastructure/fakes/fake-behaviour';

/**
 * Bot simulado: máquina de estados determinista, sin modelo de lenguaje.
 *
 * Avanza por el guion según cuántas veces habló el visitante. Sin costo, sin
 * variación entre demostraciones y sin nada que pueda inventarse un precio.
 *
 * **Ignora lo que diga el visitante a la hora de decidir qué responder.** No es
 * una limitación: es la propiedad que se quiere. Un mensaje con instrucciones
 * incrustadas no puede cambiar el comportamiento de algo que no lee
 * instrucciones (RN13 de la auditoría, `CLAUDE.md` §4).
 */

const MAX_VISITOR_TURNS = DEMO_CHAT_SCRIPT.length;

function visitorTurns(history: readonly ChatTurn[]): number {
  return history.filter((turn) => turn.role === 'visitor').length;
}

export class FakeChat implements ChatPort {
  constructor(private readonly behaviour: FakeBehaviour = HEALTHY_WITH_LATENCY) {}

  async reply(history: readonly ChatTurn[]): Promise<ChatReply> {
    await applyBehaviour(this.behaviour, 'chat');

    const turn = visitorTurns(history);
    if (turn >= MAX_VISITOR_TURNS) {
      return { text: DEMO_CHAT_LIMIT, turnLimitReached: true };
    }

    return { text: DEMO_CHAT_SCRIPT[turn] ?? DEMO_CHAT_LIMIT, turnLimitReached: false };
  }
}
