/**
 * Textos de la vista de sistema de diseño de P1.
 *
 * **Este archivo se borra en P2**, junto con la página que lo usa: existe para
 * poder mirar los dos modos y los cinco componentes uno al lado del otro y
 * comprobar el criterio de aceptación de P1. Cuando lleguen las once secciones
 * del prototipo, deja de tener sentido.
 */

export const DESIGN_SYSTEM_PREVIEW = {
  title: 'Sistema de diseño',
  intro:
    'Los tokens y los componentes base, en el modo activo. Cambie de modo con el botón para revisar los dos.',
  sections: {
    buttons: 'Botones',
    labels: 'Etiquetas y estados',
    field: 'Campos',
    questions: 'Preguntas',
    inverted: 'Franja invertida',
  },
  buttons: {
    solid: 'Ver trabajos',
    outline: 'Conversemos',
  },
  label: 'Comercio',
  statuses: {
    available: 'Disponible',
    inProgress: 'En desarrollo',
  },
  field: {
    label: 'Nombre',
    placeholder: 'Su nombre',
  },
  invertedNote:
    'Esta franja usa el esquema contrario al modo activo. El texto secundario tiene que seguir legible acá.',
  questions: [
    {
      id: 'plazos',
      question: '¿En cuánto tiempo está listo?',
      answer:
        'Depende del alcance. Después de conversar le enviamos una proforma con el plazo por escrito.',
    },
    {
      id: 'soporte',
      question: '¿Qué pasa después de entregar?',
      answer: 'Queda el acompañamiento: cambios, dudas y arreglos, con alguien que contesta.',
    },
  ],
} as const;
