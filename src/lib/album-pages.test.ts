import { describe, test, expect } from "bun:test";
import { collectAlbumPages } from "./album-pages";

describe("pagination of complete album",()=>{
  test("collects more than Supabase's default 1000-row cap",async()=>{
    const items=Array.from({length:1107},(_,i)=>({id:i}));
    const result=await collectAlbumPages(async(from,to)=>({data:items.slice(from,to+1),error:null}),200);
    expect(result.length).toBe(1107);
    expect(result.at(-1)).toEqual({id:1106});
  });
  test("does not swallow database failures",async()=>{
    expect(collectAlbumPages(async()=>({data:null,error:{message:"Sin acceso"}}))).rejects.toThrow("Sin acceso");
  });
  test("returns empty sets cleanly",async()=>{
    expect(await collectAlbumPages(async()=>({data:[],error:null}))).toEqual([]);
  });
  test("detects unexpectedly large collections instead of silently dropping rows",async()=>{
    expect(collectAlbumPages(async()=>({data:[1,2],error:null}),2,2)).rejects.toThrow("demasiados");
  });
});
