import { describe, expect, test } from "bun:test";
import {
  WORLD_W, WORLD_H, initialWorld, parseWorld, canWalk, canPlace,
  isHouse, isWater, findPath, pointKey
} from "./couple-world";

describe("Nuestro Mundo: reglas del mapa y migración",()=>{
  test("el terreno permanece dentro de límites",()=>{
    expect(WORLD_W).toBe(28);
    expect(WORLD_H).toBe(20);
    expect(canWalk("garden",-1,2)).toBe(false);
    expect(canWalk("garden",28,1)).toBe(false);
    expect(canWalk("home",10,20)).toBe(false);
  });
  test("la casa y el lago son obstáculos exteriores",()=>{
    expect(isHouse(13,8)).toBe(true);
    expect(canWalk("garden",13,8)).toBe(false);
    expect(isWater(23,16)).toBe(true);
    expect(canWalk("garden",23,16)).toBe(false);
  });
  test("el interior tiene límites propios",()=>{
    expect(canWalk("home",13,16)).toBe(true);
    expect(canWalk("home",2,8)).toBe(false);
  });
  test("objetos respetan habitación y terreno",()=>{
    expect(canPlace("home",10,10,"bed")).toBe(true);
    expect(canPlace("garden",10,10,"bed")).toBe(false);
    expect(canPlace("garden",23,16,"flowers")).toBe(false);
    expect(canPlace("garden",13,8,"tree")).toBe(false);
  });
  test("objetos grandes bloquean caminar, plantas no",()=>{
    expect(canWalk("garden",5,5,{"5,5":"tree"})).toBe(false);
    expect(canWalk("garden",5,5,{"5,5":"flowers"})).toBe(true);
    expect(canWalk("home",9,9,{"9,9":"sofa"})).toBe(false);
  });
  test("el mapa predeterminado es independiente por instancia",()=>{
    const a=initialWorld(),b=initialWorld();
    a.garden["1,1"]="flowers";
    expect(b.garden["1,1"]).toBeUndefined();
  });
  test("datos externos no pueden introducir muebles o claves arbitrarias",()=>{
    const parsed=parseWorld({version:2,name:"Prueba",garden:{"3,3":"cat","1,1":"bad_id","999,2":"tree","13,8":"tree","__proto__":"tree"},home:{}});
    expect(parsed.garden["3,3"]).toBe("cat");
    expect(parsed.garden["1,1"]).toBeUndefined();
    expect(parsed.garden["999,2"]).toBeUndefined();
    expect(parsed.garden["13,8"]).toBeUndefined();
  });
  test("migra mobiliario de la primera versión sin perderlo",()=>{
    const parsed=parseWorld({name:"Nuestro sitio",furniture:{"2,2":"🌳","3,4":"🌷","13,8":"🌳"}});
    expect(parsed.version).toBe(2);
    expect(parsed.garden["2,2"]).toBe("tree");
    expect(parsed.garden["3,4"]).toBe("flowers");
    expect(parsed.garden["13,8"]).toBeUndefined();
    expect(parsed.name).toBe("Nuestro sitio");
  });
  test("una ruta encuentra un camino sin atravesar muebles",()=>{
    const furniture={"5,5":"tree" as const};
    const path=findPath("garden",{x:4,y:5},{x:6,y:5},furniture);
    expect(path.length).toBeGreaterThan(2);
    expect(path.some(p=>p.x===5&&p.y===5)).toBe(false);
    expect(pointKey(path.at(-1)!.x,path.at(-1)!.y)).toBe("6,5");
  });
  test("destinos bloqueados no producen recorrido",()=>{
    expect(findPath("garden",{x:4,y:5},{x:13,y:8},{})).toEqual([]);
    expect(findPath("garden",{x:4,y:5},{x:23,y:16},{})).toEqual([]);
  });
  test("mundo nulo vuelve al estado inicial",()=>{
    expect(parseWorld(null).garden).toEqual(initialWorld().garden);
  });
});
