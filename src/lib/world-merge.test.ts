import { describe, test, expect } from "bun:test";
import { initialWorld, type WorldDoc } from "./couple-world";
import { mergeWorlds } from "./world-merge";

describe("shared world simultaneous editing", () => {
  test("both partners keep changes on different tiles", () => {
    const base=initialWorld();
    const mine:WorldDoc={...base,garden:{...base.garden,"2,3":"flowers"}};
    const theirs:WorldDoc={...base,garden:{...base.garden,"4,7":"tree"}};
    const {merged,conflicts}=mergeWorlds(base,mine,theirs);
    expect(conflicts).toEqual([]);
    expect(merged.garden["2,3"]).toBe("flowers");
    expect(merged.garden["4,7"]).toBe("tree");
  });
  test("overlapping changes remain explicit conflicts", () => {
    const base=initialWorld();
    const mine={...base,garden:{...base.garden,"2,3":"flowers" as const}};
    const theirs={...base,garden:{...base.garden,"2,3":"tree" as const}};
    const result=mergeWorlds(base,mine,theirs);
    expect(result.conflicts).toEqual(["garden:2,3"]);
    expect(result.merged.garden["2,3"]).toBe("flowers");
  });
  test("deleting a tile is not lost during an independent edit", () => {
    const base=initialWorld();
    const mine={...base,garden:{...base.garden}};
    delete mine.garden["4,4"];
    const theirs={...base,home:{...base.home,"12,9":"table" as const}};
    const result=mergeWorlds(base,mine,theirs);
    expect(result.conflicts).toEqual([]);
    expect(result.merged.garden["4,4"]).toBeUndefined();
    expect(result.merged.home["12,9"]).toBe("table");
  });
  test("title changes are merged or explicitly flagged", () => {
    const base=initialWorld();
    const mine={...base,name:"Un lugar especial"};
    const theirs={...base,name:"Nuestro hogar"};
    expect(mergeWorlds(base,mine,theirs).conflicts).toContain("name");
    expect(mergeWorlds(base,base,theirs).merged.name).toBe("Nuestro hogar");
  });
});
