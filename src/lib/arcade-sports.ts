export type Sport = "golf" | "bowling" | "curling" | "basket";
export type SportDifficulty = "facil" | "normal" | "dificil";
export const SPORTS: { id: Sport; name: string; tag: string; rounds: number; crop: string }[] = [
  { id: "golf", name: "Minigolf del jardín", tag: "3 hoyos", rounds: 3, crop: "sport-golf" },
  { id: "bowling", name: "Bolos tropicales", tag: "5 lanzamientos", rounds: 5, crop: "sport-bowling" },
  { id: "curling", name: "Curling de precisión", tag: "4 rondas", rounds: 4, crop: "sport-curling" },
  { id: "basket", name: "Duelo de canastas", tag: "5 tiros", rounds: 5, crop: "sport-basket" },
];
export function targetX(round: number) { return [0, 1.15, -1.15][(round - 1) % 3] ?? 0; }
export function botAim(sport: Sport, round: number, difficulty: SportDifficulty) {
  const error = difficulty === "facil" ? 11 : difficulty === "normal" ? 5 : 1.5;
  const angle = sport === "golf" ? Math.atan2(targetX(round), 9) * 180 / Math.PI : 0;
  const power = sport === "bowling" ? 85 : sport === "basket" ? 62 : sport === "curling" ? 24 : 57;
  return { angle: angle + (Math.random() - 0.5) * error, power: power + (Math.random() - 0.5) * error };
}
export function curlingScore(x: number, z: number) {
  const distance = Math.hypot(x, z + 4);
  return distance < 0.5 ? 10 : distance < 1 ? 7 : distance < 1.8 ? 4 : distance < 2.6 ? 1 : 0;
}