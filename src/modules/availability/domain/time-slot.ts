import type { TimeRange } from './time-range';

/**
 * Un espacio agendable.
 *
 * `SlotId` es una cadena **marcada**: no se puede pasar un `string` cualquiera
 * donde se espera un identificador de espacio, ni al revés. Es lo que pide
 * `CLAUDE.md` §3 al prohibir primitivos sueltos, y cuesta una línea.
 *
 * El identificador se deriva del instante de inicio, así que es estable entre
 * peticiones: el mismo espacio tiene el mismo identificador aunque se calcule
 * dos veces. Eso es lo que permite que P6 verifique que el espacio que el
 * visitante eligió es el mismo que se va a reservar.
 */

declare const slotIdBrand: unique symbol;

type SlotId = string & { readonly [slotIdBrand]: 'SlotId' };

export interface TimeSlot {
  readonly id: SlotId;
  readonly range: TimeRange;
}

function slotIdOf(startsAt: Date): SlotId {
  return startsAt.toISOString() as SlotId;
}

export function slotOf(range: TimeRange): TimeSlot {
  return { id: slotIdOf(range.startsAt), range };
}
