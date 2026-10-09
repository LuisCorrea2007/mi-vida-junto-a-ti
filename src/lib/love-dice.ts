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
      'Dale un beso largo, lento y con lengua; no lo cortes hasta que tu pareja lo pida.',
      'Acércate por detrás, abrázala por la espalda y deja un beso húmedo en su cuello.',
      'Dale un beso apasionado con lengua mientras sujetas su cintura con fuerza; si se embriagan más, sigan.',
      'Bésala corto y jugoso tres veces seguidas, y la cuarta mantenla todo lo que aguanten.',
      'Acaricia su espalda despacio de arriba abajo mientras le das besos suaves en la boca.',
      'Dale un beso muy húmedo y profundo, sin remedio, como si fuera lo último que harás hoy.',
      'Súbela a una mesa o cómoda, quédate entre sus piernas y bésala sin soltarla.',
      'Acaríciala por debajo de la blusa, solo por la espalda, mientras le das besos en el oído.',
      'Recuéstala suavemente en la cama y cubre su cuerpo con el tuyo dándole besos lentos.',
      'Dale un beso con lengua mientras tus manos acarician su cintura y su espalda baja.',
      'Acuéstense de lado frente a frente y bésense despacio durante todo el turno, sin hablar.',
      'Besa su cuello subiendo despacio hasta su oreja y termina con un beso profundo en la boca.',
      'Dale un masaje en hombros y espalda con las dos manos; sube el ritmo cuando te lo pida.',
      'Tómala de la nuca con una mano y dale un beso largo que ella tenga que pedir que pare.',
      'Acaricia sus muslos despacio por encima de la ropa mientras se besan en el sofá.',
      'Dale un beso mordisqueando suavemente el labio inferior; luego cambia a un beso húmedo y lento.',
      'Ponla de espaldas a ti, abrázala por la cintura y bésale el cuello mientras acaricias sus brazos.',
      'Dale un beso apasionado contra la puerta o la pared, con una mano en su nuca y otra en su espalda.',
      'Túmbense juntos y acaríciale toda la espalda con las yemas de los dedos; termina con un beso largo.',
      'Bésala con lengua de forma lenta y profunda; cada vez que respire, vuelve a empezar.',
      'Acaricia su cintura por dentro de la ropa, solo un poquito, mientras le das besos cortos en la boca.',
      'Dale un beso en cada costado del cuello y remata con uno profundo en los labios.',
      'Sostén su rostro con las dos manos y dale el beso más lento y apasionado que puedas dar.',
      'Recuéstala en el sofá, acuéstate sobre ella y bésala acariciándole el cabello con fuerza.',
      'Dale un masaje en la nuca bajando por la espalda y termina con un beso húmedo en el hombro.',
      'Bésala corto, rápido y jugoso diez veces, y en la última quédense pegados con lengua.',
      'Acaríciala por dentro del muslo, despacio, subiendo solo hasta donde ella te diga, mientras la abrazas.',
      'Toma sus manos, extiéndelas sobre la cama y dale besos largos y húmedos sin soltarla.',
      'Dale un beso apasionado y con lengua mientras la levantas o la cargas un momento.',
      'Acércate por detrás mientras esté sentada, rodea su cintura y besa su oreja y su cuello despacio.',
      'Acaricia su pecho por encima de la ropa con movimientos lentos mientras se besan con lengua.',
      'Quédate encima de ella sin poner peso, bésala con lengua y acaríciale el costado de arriba abajo.',
      'Dale un beso muy lento con la boca abierta, saboreándola, y dile al oído qué te gusta de sus besos.',
      'Pásale las manos por todo su cuerpo por encima de la ropa, despacio, de los hombros a la cintura.',
      'Bésala en la boca, luego en la mejilla, luego en el cuello, y vuelve a la boca con un beso profundo.',
      'Siéntala sobre ti, abrázala por la espalda con las dos manos y bésala sin dejar de acariciarla.',
      'Dale un beso húmedo y apasionado mientras tu mano acaricia su nuca y su pelo; solo cuando los dos quieran parar.',
      'Túmbense el uno sobre el otro en la cama y compitan por quién da el beso más largo; gana quien aguante más.',
      'Acaríciale la espalda desnuda por debajo de la camiseta, con calma, y dile qué sientes al tocarla.',
      'Termina el turno como quieras: un beso con lengua, un masaje o los dos; tu pareja elige el orden.',
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
    '¿Qué beso nuestro te gusta más: largo y lento, corto y jugoso, o apasionado con lengua?',
    '¿Dónde te gusta más que te bese: la boca, el cuello, la oreja o la espalda?',
    '¿Te gustan más los besos húmedos y profundos o los besos lentos con mordisco suave?',
    '¿Prefieres que me acerque por delante o que te abrace por detrás y te bese el cuello?',
    '¿Qué te gusta más: que te acaricie la espalda por debajo de la camiseta o la cintura por dentro de la ropa?',
    '¿Recuerdas el beso nuestro que más te ha puesto? ¿Por qué fue tan bueno?',
    '¿Prefieres que la caricia suba lenta por los muslos o que empiece por la espalda baja?',
    '¿Cómo te gusta que te abrace cuando te beso: con las manos en tu cintura, en tu nuca o en toda la espalda?',
    '¿Qué presión te gusta en un masaje: suave y lento o fuerte y con ganas?',
    '¿Te gusta más besar tú o que te besen? ¿Y que te sujeten la cara al besarla?',
    '¿Dónde de la casa nos faltaría besarnos con más ganas?',
    '¿Qué te hace más efecto: un beso largo sin parar o varios besos cortos seguidos?',
    '¿Prefieres quedar encima o debajo cuando nos besamos acostados?',
    '¿Qué caricia mía repetirías hoy mismo sin pensarlo?',
    '¿Cómo me avisas cuando quieres que siga y cómo cuando prefieres pausa?',
    '¿Qué beso me vas a dar tú en el próximo turno?',
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