import type { ReactNode } from 'react';

import styles from './button.module.css';

/**
 * El botón del prototipo, en sus dos tratamientos: sólido y de línea.
 *
 * Se renderiza como `<a>` cuando lleva destino y como `<button>` cuando no. La
 * diferencia importa para el teclado y para el lector de pantalla: un enlace
 * navega, un botón actúa, y no son intercambiables aunque se vean igual.
 */

export type ButtonVariant = 'solid' | 'outline';

/** La firma de una acción de servidor tal como la invoca un `<form>`. */
type FormAction = (formData: FormData) => void | Promise<void>;

interface ButtonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly href?: string;
  readonly type?: 'button' | 'submit';
  /**
   * Acción propia de este botón, distinta de la del formulario que lo contiene.
   *
   * Existe por un motivo concreto: un formulario de edición necesita «Guardar» y
   * «Eliminar», y la forma intuitiva —meter un segundo `<form>` dentro del
   * primero— **es HTML inválido**. El analizador del navegador descarta la
   * etiqueta anidada y sus campos quedan colgando del formulario de fuera, así
   * que el botón de borrar termina guardando. `formAction` es el mecanismo que
   * HTML tiene justamente para esto.
   */
  readonly formAction?: FormAction;
  /**
   * Salta la validación del navegador al enviar. Un botón que no guarda no tiene
   * por qué exigir que los campos obligatorios estén completos.
   */
  readonly formNoValidate?: boolean;
  /**
   * Apaga el botón mientras la acción está en curso.
   *
   * Es la única forma de que un envío lento no se convierta en dos: el
   * formulario de contacto cambia el rótulo a «Enviando…», y sin esto un
   * segundo clic sobre ese rótulo manda la ficha otra vez. Solo aplica a la
   * forma `<button>`: un `<a>` deshabilitado no existe en HTML.
   */
  readonly disabled?: boolean;
}

function classNamesFor(variant: ButtonVariant): string {
  return variant === 'outline' ? `${styles['button']} ${styles['outline']}` : `${styles['button']}`;
}

export function Button({
  children,
  variant = 'solid',
  href,
  type = 'button',
  formAction,
  formNoValidate,
  disabled = false,
}: ButtonProps) {
  const className = classNamesFor(variant);

  if (href !== undefined) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      {...(formAction === undefined ? {} : { formAction })}
      {...(formNoValidate === undefined ? {} : { formNoValidate })}
    >
      {children}
    </button>
  );
}
