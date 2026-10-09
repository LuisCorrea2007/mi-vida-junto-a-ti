export type DiceLevel = 'tierno' | 'caliente' | 'atrevido' | 'muy-atrevido';
export type DiceMode = 'dados' | 'verdad' | 'reto';
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
  caliente: {
    label: 'Caliente', description: 'La chispa de un beso que se hace esperar.',
    actions: [
      'Acérquense como para un beso y esperen una sonrisa antes de darlo',
      'Bailen despacio con las manos entrelazadas',
      'Susúrrale qué detalle suyo te distrae cuando lo tienes cerca',
      'Dale un beso lento, si ambos lo desean',
      'Invítale a elegir la canción de su próximo beso',
      'Coquetea usando únicamente la mirada',
      'Toma su mano y pídele una cita para esta misma noche',
      'Dile muy cerca qué te encanta de su sonrisa',
      'Dejen que un abrazo se convierta en un baile',
      'Pide un beso como si fuera el primero de los dos',
      'Dedícale una frase de su canción favorita al oído',
      'Recreen su despedida más difícil con un abrazo',
      'Elijan juntos un beso para celebrar esta noche',
      'Déjale elegir entre un beso lento o un abrazo largo',
      'Mírale a los ojos y cuenta por qué quieres quedarte cerca',
      'Róbale una sonrisa antes de pedirle un beso',
      'Inventen una señal privada para decir «quiero un beso»',
      'Acérquense frente a frente sin apartar la sonrisa',
      'Dile con voz baja qué recuerdo de sus besos guardarías',
      'Invítale a bailar como en la escena final de una película',
      'Ofrece un beso en la mano y espera su respuesta',
      'Encuentren una canción que describa su química',
      'Dale un abrazo por la cintura si le gusta',
      'Dile una invitación romántica sin usar la palabra beso',
      'Elijan cómo terminarían su cita perfecta esta noche',
    ],
  },
  atrevido: {
    label: 'Atrevido', description: 'Coqueteo y contacto elegido por ambos.',
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
    label: 'Muy picante', description: 'Besos, caricias y masajes. Tú marcas el límite.',
    actions: [
      'Acércate por detrás, rodea suavemente su cintura y pregúntale si le apetece un beso en el cuello.',
      'Elige entre un abrazo apretado, un masaje en hombros o un beso prolongado; tu pareja decide cuál acepta.',
      'Coloca una mano en su espalda y acércate lentamente hasta que te indique que está cómodo o cómoda.',
      'Hagan una ronda de tres besos distintos: dulce, inesperado y apasionado.',
      'Intercambien una confesión atrevida al oído mientras mantienen sus manos entrelazadas.',
      'Prueba un masaje suave en la nuca y los hombros, preguntando primero.',
      'Baila una canción abrazando a tu pareja por la cintura.',
      'Dile al oído algo que te atraiga de ella o él mientras le acaricias el brazo.',
      'Pídele que elija dónde recibir un beso: frente, mejilla, cuello o labios.',
      'Acércate despacio, acaricia su mejilla y pregunta si le apetece un beso largo.',
      'Prueba una secuencia de besos: frente, mejilla, labios, dejando que tu pareja marque el ritmo.',
      'Susúrrale lo mucho que te gustan sus labios antes de acercarte.',
      'Dale un beso en el cuello si lo ha elegido expresamente.',
      'Déjale elegir cómo quiere recibir el siguiente beso.',
      'Mantengan los ojos cerrados antes de un beso, siempre que resulte cómodo.',
      'Interrumpan un abrazo con un beso que ambos hayan esperado.',
      'Cuéntale qué sensación te provoca recibir un beso lento.',
      'Dale un masaje ligero en las manos y pregúntale qué presión prefiere.',
      'Usa las yemas de los dedos para acariciar suavemente su antebrazo.',
      'Acaricia su cabello durante un abrazo, si le resulta agradable.',
      'Rodea su cintura con los brazos y espera su respuesta antes de acercarte más.',
      'Coloca una mano en su espalda para acompañar un baile lento.',
      'Propón un masaje relajante en las piernas, solo en las zonas acordadas.',
      'Pregúntale si prefiere una caricia en la mejilla, la nuca o las manos.',
      'Elige si hoy prefieres un beso, una conversación íntima o simplemente estar juntos.',
      'Sentados frente a frente, sostengan sus manos y compartan un beso largo al ritmo que ambos elijan.',
      'Abraza a tu pareja por detrás y dale un beso en la mejilla, si le apetece.',
      'Intercambien un masaje en los hombros; quien lo recibe elige la presión y cuándo cambiar.',
      'Acaricia despacio su espalda por encima de la ropa mientras se abrazan.',
      'Acomódense juntos en el sofá y alternen besos en los labios y en la mejilla.',
      'Acerca tu frente a la suya, acaricia su rostro y deja que tu pareja inicie el beso.',
      'Dale un masaje en las manos, dedo por dedo, y termina con un beso en la palma.',
      'Bailen abrazados con una mano en la cintura y la otra entrelazada.',
      'Pídele que elija entre una caricia en el cabello, un beso en el cuello o un masaje en la nuca.',
      'Recostados cómodamente, abrácense de lado y acaricien sus brazos por turnos.',
      'Comparte un beso prolongado y hagan una pausa para comprobar si ambos quieren otro.',
      'Dale un masaje suave en los antebrazos mientras te cuenta qué contacto le gusta más.',
      'Apoya tus manos suavemente en su cintura y deja que decida la distancia entre los dos.',
      'Durante un abrazo, intercambien besos en la mejilla sin soltarse las manos.',
      'Tu pareja elige tres gestos entre besos, abrazos y masajes en los hombros; compártanlos en ese orden.',
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
export const DICE_TRUTHS: Record<DiceLevel, string[]> = {
  tierno: [
    '¿Qué pequeño gesto mío te hace sentir más querido?', '¿Cuándo te sentiste en casa conmigo por primera vez?',
    '¿Qué recuerdo nuestro repetirías hoy?', '¿Qué te gustaría que celebráramos más seguido?',
    '¿Qué canción cuenta un pedacito de nosotros?', '¿Qué abrazo nuestro no has olvidado?',
    '¿Qué plan sencillo te gustaría hacer conmigo?', '¿Qué quisieras que supiera sobre cómo cuidarte?',
  ],
  caliente: [
    '¿Qué recuerdas del instante antes de nuestro primer beso?', '¿Qué hago sin darme cuenta que te parece irresistible?',
    '¿Qué canción pondrías para bailar muy cerca conmigo?', '¿Cómo me pedirías un beso sin hablar?',
    '¿Qué cita nuestra tuvo más química?', '¿Qué detalle de mi mirada te gusta?',
    '¿Cuál sería tu despedida perfecta esta noche?', '¿Qué cumplido mío te hace sonrojar?',
  ],
  atrevido: [
    '¿Qué momento nuestro te hizo perder la timidez?', '¿Cómo sería una cita secreta organizada por ti?',
    '¿Qué beso nuestro repetirías sin cambiar nada?', '¿Qué frase te gustaría que te dijera al oído?',
    '¿Cómo me coquetearías si nos conociéramos hoy?', '¿Qué gesto te hace querer acercarte más?',
    '¿Cuál es tu rincón favorito para estar a solas conmigo?', '¿Qué invitación romántica todavía no te has atrevido a hacerme?',
  ],
  'muy-atrevido': [
    '¿Qué parte de mi rostro te gusta más besar y por qué?',
    '¿Qué caricia en las manos, cabello, hombros o espalda te resulta especialmente agradable?',
    '¿Recuerdas una ocasión en la que deseaste besarme y no lo dijiste?',
    '¿Prefieres abrazos por la cintura, un masaje lento o besos en el cuello?',
    '¿Qué tipo de contacto físico te hace sentir deseado o deseada?',
    '¿Cómo te gusta que te pidan permiso antes de una caricia nueva?',
    '¿Qué parte del cuerpo no íntima prefieres que te acaricien?',
    '¿Qué señal usamos para indicar «más despacio»?',
    '¿Prefieres iniciar tú un beso o que yo me acerque primero?',
    '¿Qué te gusta más durante un abrazo: una caricia en el cabello o en la espalda?',
    '¿Cómo sería una ronda de besos elegida completamente por ti?',
    '¿Qué presión te resulta cómoda en un masaje de hombros?',
    '¿Qué gesto de contacto físico te gustaría repetir hoy conmigo?',
    '¿Prefieres besos largos con pausas o varios besos breves?',
    '¿Cómo me indicarías que quieres seguir abrazados un poco más?',
    '¿Qué caricia te gustaría proponer para nuestra próxima ronda?',
  ],
};

export function canStartChallenge(level: DiceLevel, ready: readonly boolean[]): boolean {
  return level === 'tierno' || (ready[0] === true && ready[1] === true);
}
export function roundComplete(points: readonly number[], target: number): boolean {
  return points.reduce((total, point) => total + point, 0) >= target;
}
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
  return actions.flatMap(action => places.flatMap(place => durations.map(seconds => ({
    id: JSON.stringify([action, place, seconds]), action, place, seconds,
  }))));
}

export function availableRolls(pool: LoveRoll[], seen: readonly string[], locks: Partial<LoveRoll> = {}): LoveRoll[] {
  const used = new Set(seen);
  return pool.filter(r => !used.has(r.id) && (!locks.action || r.action === locks.action)
    && (!locks.place || r.place === locks.place) && (!locks.seconds || r.seconds === locks.seconds));
}

export function nextPlayer(current: number): number { return current === 0 ? 1 : 0; }