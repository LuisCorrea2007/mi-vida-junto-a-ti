import type { DecorId, WorldDoc } from "./couple-world";

export type MergeResult = { merged: WorldDoc; conflicts: string[] };
type Area = Record<string, DecorId>;

/** Three-way merge: preserve distinct edits from each partner; never silently overwrite competing edits. */
export function mergeWorlds(base: WorldDoc, mine: WorldDoc, theirs: WorldDoc): MergeResult {
  const conflicts: string[] = [];
  const mergeDecor = (area: "garden" | "home"): Area => {
    const out: Area = {};
    const keys = new Set([...Object.keys(base[area]), ...Object.keys(mine[area]), ...Object.keys(theirs[area])]);
    for (const key of keys) {
      const previous = base[area][key];
      const local = mine[area][key];
      const remote = theirs[area][key];
      if (local !== previous && remote !== previous && local !== remote) {
        conflicts.push(area + ":" + key);
        if (local) out[key] = local;
      } else {
        const chosen = local === previous ? remote : local;
        if (chosen) out[key] = chosen;
      }
    }
    return out;
  };
  const name = mine.name === base.name ? theirs.name : mine.name;
  if (mine.name !== base.name && theirs.name !== base.name && mine.name !== theirs.name) conflicts.push("name");
  return {
    merged: {version: 2, name, garden: mergeDecor("garden"), home: mergeDecor("home")},
    conflicts
  };
}
