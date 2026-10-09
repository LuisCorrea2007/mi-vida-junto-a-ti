export type DiceLevel = 'tierno' | 'atrevido' | 'muy-atrevido';
export type LoveRoll = { id: string; action: string; place: string; seconds: number };

export const DICE_LEVELS: Record<DiceLevel, { label: string; description: string; actions: string[] }> = {
  tierno: {
    label: 'Tierno', description: 'Pequeños gestos, mucho nosotros.',
    actions: [
      'Dale un abrazo sin mirar el teléfono', 'Dale un beso en la frente',
      'Cuéntale qué detalle suyo te alegra el día', 'Toma su mano y acaríciala suavemente',
      'Dile tres cosas que admiras de su forma de ser', 'Recuerda en voz alta su primera cita',
      'Dedícale una canción y cuéntale por qué', 'Baila con tu pareja abrazándola',
      'Mírense a los ojos y sonrían', 'Acomódate a su lado y escucha cómo se siente',
      'Dile qué recuerdo de los dos guardarías para siempre', 'Dibuja un corazón en la palma de su mano',
      'Apoya tu cabeza en su hombro', 'Acaricia su cabello si le gusta',
      'Dale un beso en la mejilla', 'Inventen un saludo secreto de los dos',
      'Dile qué hizo que te enamoraras', 'Cuéntale un sueño que quieras compartir',
      'Agradece algo concreto que haya hecho por ti', 'Hazle un cumplido sin mencionar su apariencia',
      'Comparte una anécdota que le saque una sonrisa', 'Dile qué significa sentirse en casa a su lado',
      'Abrácense al ritmo de una canción', 'Imaginen cómo celebrar su próxima fecha especial',
      'Dile una promesa pequeña que sí puedas cumplir',
    ],
  },
  atrevido: {
    label: 'Atrevido', description: 'Coqueteo, miradas y besos elegidos.',
    actions: [
      'Pídele un beso y deja que elija cómo', 'Susúrrale un cumplido al oído',
      'Acércate despacio y espera a que te invite a un beso', 'Dale un beso en la mano mirándole a los ojos',
      'Baila cerca de tu pareja con su canción favorita', 'Dile qué sonrisa suya no puedes resistir',
      'Invítale a un abrazo de película', 'Intercambien una mirada cómplice sin hablar',
      'Deja que tu pareja elija una canción para bailar cerca', 'Hazle una invitación romántica en voz baja',
      'Pídele que describa su beso favorito', 'Dile qué detalle de su estilo te encanta',
      'Toma su mano y acércala a tu corazón', 'Dale un beso de despedida como si no quisieras irte',
      'Recreen el instante antes de su primer beso', 'Coquetea como si estuvieras pidiendo su primera cita',
      'Dile qué te gusta de tenerle cerca', 'Elige un apodo cariñoso y pídele que lo apruebe',
      'Invítale a bailar sin que se separen las manos', 'Dale un beso de bienvenida inesperado si quiere',
      'Hagan una pausa para abrazarse y respirar juntos', 'Dedícale una frase de amor sin dejar de mirarle',
      'Deja que elija entre un abrazo o un beso', 'Hazle un cumplido con la voz de un personaje de película',
      'Invítale a cerrar los ojos para recibir un beso en la mejilla',
    ],
  },
  'muy-atrevido': {
    label: 'Muy atrevido', description: 'Más complicidad, siempre al ritmo de ambos.',
    actions: [
      'Pídele un beso lento y deja que marque el ritmo', 'Dile al oído qué te hace perder la timidez',
      'Invítale a un baile lento sin apartar la mirada', 'Deja que tu pareja dirija un momento de besos',
      'Pídele permiso para darle un beso en el cuello', 'Abrázale por la cintura si le resulta cómodo',
      'Cuéntale qué momento romántico quisieras repetir', 'Propón una cita privada que les ilusione a ambos',
      'Invítale a acercarse y elegir el siguiente beso', 'Susúrrale una invitación a quedarse abrazados',
      'Dale un beso y hagan una pausa para mirarse', 'Pídele que elija dónde pasar una noche romántica',
      'Comparte una canción que te haga querer besarle', 'Invítale a un abrazo muy cerca, sin prisa',
      'Recreen una escena de beso de su película favorita', 'Dile qué te atrae de su manera de mirarte',
      'Pregúntale qué gesto romántico le gustaría que hicieras', 'Deja que decida entre bailar cerca o besarse',
      'Sorpréndele con una declaración de amor al oído', 'Invítale a un beso con la música de fondo que elija',
      'Cuéntale cómo sería una cita de los dos sin distracciones', 'Acércate a su oído y dile por qué le eliges',
      'Propón intercambiar besos y cumplidos por turnos', 'Dale un abrazo cálido antes de pedir otro beso',
      'Invítale a terminar el momento con su beso favorito',
    ],
  },
};

export const DICE_PLACES = [
  'en la cama', 'en el sofá', 'en la cocina, lejos del fuego', 'junto a la mesa',
  'en el dormitorio', 'en la sala', 'junto a la ventana', 'bajo una manta',
  'sobre una alfombra cómoda', 'en el rincón de lectura', 'junto a la puerta de casa',
  'en un sillón', 'en el comedor', 'en el pasillo de casa', 'en el balcón seguro',
  'en una terraza privada', 'en el jardín de casa', 'en su rincón favorito',
  'junto a las almohadas', 'donde estén cómodos ahora',
];
export const DICE_DURATIONS = [15, 30, 45, 60, 90, 120];
export const LIKELY_QUESTIONS = [
  '¿Quién se enamoró primero?', '¿Quién planearía una escapada sorpresa?',
  '¿Quién guarda más fotos de los dos?', '¿Quién prepara el desayuno para sorprender?',
  '¿Quién recuerda mejor nuestras fechas?', '¿Quién elegiría una cita bajo las estrellas?',
  '¿Quién pide un abrazo sin decirlo?', '¿Quién se ríe primero cuando intentan ponerse serios?',
  '¿Quién dedica más canciones?', '¿Quién elegiría una noche en casa antes que salir?',
  '¿Quién se aprende los gustos del otro más rápido?', '¿Quién empezaría a bailar en la cocina?',
  '¿Quién escribiría una carta a mano?', '¿Quién se emociona con los recuerdos?',
  '¿Quién inventaría un apodo nuevo?', '¿Quién se queda dormido viendo una película?',
  '¿Quién haría un viaje por una sorpresa?', '¿Quién se come el último bocado?',
  '¿Quién elegiría el postre para compartir?', '¿Quién abrazaría al otro después de un día difícil?',
  '¿Quién se fija más en los pequeños detalles?', '¿Quién tomaría una foto sin que el otro se dé cuenta?',
  '¿Quién organiza la próxima cita?', '¿Quién contaría su historia de amor con más detalles?',
];

export function diceCombinations(actions: readonly string[], places: readonly string[], durations: readonly number[]): LoveRoll[] {
  return actions.flatMap((action, a) => places.flatMap((place, p) => durations.map(seconds => ({
    id: `${a}:${p}:${seconds}`, action, place, seconds,
  }))));
}

export function availableRolls(pool: LoveRoll[], seen: readonly string[], locks: Partial<LoveRoll> = {}): LoveRoll[] {
  const used = new Set(seen);
  return pool.filter(r => !used.has(r.id) && (!locks.action || r.action === locks.action)
    && (!locks.place || r.place === locks.place) && (!locks.seconds || r.seconds === locks.seconds));
}

export function nextPlayer(current: number): number { return current === 0 ? 1 : 0; }