/**
 * El modelo que conversa.
 *
 * **El puerto devuelve texto, no órdenes.** Lo que produzca el modelo no puede
 * tocar el calendario, ni el almacén, ni el correo: el sistema lee la respuesta,
 * la valida contra esquema y decide (`CLAUDE.md` §4, RN9). Por eso acá no hay
 * ninguna forma de pedirle que ejecute nada.
 *
 * `turnLimitReached` existe porque el corte por presupuesto es una regla del
 * sistema, no una decisión del modelo (RN de tope de gasto).
 */

export interface ChatTurn {
  readonly role: 'visitor' | 'assistant';
  readonly text: string;
}

export interface ChatReply {
  readonly text: string;
  readonly turnLimitReached: boolean;
}

export interface ChatPort {
  reply(history: readonly ChatTurn[]): Promise<ChatReply>;
}
