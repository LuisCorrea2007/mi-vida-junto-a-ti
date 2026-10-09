/** Data model shared by the pixel-world editor, canvas and Supabase persistence. */
export const TILE = 24;
export const WORLD_W = 28;
export const WORLD_H = 20;
export type Scene = "garden" | "home";
export type Skin = "rose" | "mint" | "lavender" | "gold";
export type HairStyle = "short" | "long" | "curly" | "cap";
export type Emote = "heart" | "wave" | "dance";
export type DecorId =
  | "tree" | "flowers" | "rosebush" | "bench" | "lamp" | "fountain"
  | "sunflower" | "plant" | "gift" | "cat" | "heart"
  | "sofa" | "bed" | "table" | "bookshelf" | "rug" | "fireplace" | "chair";
export type Point = {x:number; y:number};
export type DecorItem = {id:DecorId; name:string; icon:string; scene:Scene | "both"};
export type WorldDoc = {
  version:2;
  name:string;
  garden:Record<string,DecorId>;
  home:Record<string,DecorId>;
};
export const ITEMS: DecorItem[] = [
  {id:"tree",name:"Árbol",icon:"🌳",scene:"garden"},
  {id:"flowers",name:"Flores",icon:"🌷",scene:"garden"},
  {id:"rosebush",name:"Rosal",icon:"🌹",scene:"garden"},
  {id:"bench",name:"Banco",icon:"🪑",scene:"garden"},
  {id:"lamp",name:"Farola",icon:"💡",scene:"garden"},
  {id:"fountain",name:"Fuente",icon:"⛲",scene:"garden"},
  {id:"sunflower",name:"Girasol",icon:"🌻",scene:"garden"},
  {id:"plant",name:"Planta",icon:"🪴",scene:"both"},
  {id:"gift",name:"Regalo",icon:"🎁",scene:"both"},
  {id:"cat",name:"Gatito",icon:"🐈",scene:"both"},
  {id:"heart",name:"Corazón",icon:"💗",scene:"both"},
  {id:"sofa",name:"Sofá",icon:"🛋️",scene:"home"},
  {id:"bed",name:"Cama",icon:"🛏️",scene:"home"},
  {id:"table",name:"Mesa",icon:"🍵",scene:"home"},
  {id:"bookshelf",name:"Librero",icon:"📚",scene:"home"},
  {id:"rug",name:"Alfombra",icon:"🧶",scene:"home"},
  {id:"fireplace",name:"Chimenea",icon:"🔥",scene:"home"},
  {id:"chair",name:"Silla",icon:"🪑",scene:"home"},
];
const ids = new Set<DecorId>(ITEMS.map(x=>x.id));
export const pointKey = (x:number,y:number) => x + "," + y;
const oldIds:Record<string, DecorId> = {
  "🌳":"tree","🌷":"flowers","🪑":"bench","🧸":"gift","💡":"lamp",
  "🎁":"gift","🌻":"sunflower","🪴":"plant","⛲":"fountain","🐈":"cat"
};
export const outsideSpawn:Point = {x:13,y:14};
export const insideSpawn:Point = {x:13,y:16};
export const houseDoor:Point = {x:13,y:12};
export const homeDoor:Point = {x:13,y:18};
export function inside(x:number,y:number) {return Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<WORLD_W&&y<WORLD_H;}
export function isWater(x:number,y:number) {
  return x>=20 && y>=13 && ((x-23)**2)/13 + ((y-16)**2)/6 < 1;
}
export function isHouse(x:number,y:number) {return x>=10&&x<=17&&y>=6&&y<=12;}
export function canWalk(scene:Scene,x:number,y:number,decor:Record<string,DecorId>={}):boolean {
  if(!inside(x,y))return false;
  if(scene==="garden" && (isHouse(x,y)||isWater(x,y)))return false;
  if(scene==="home" && (x<4||x>23||y<3||y>18))return false;
  const obstacle=decor[pointKey(x,y)];
  return !obstacle || !["tree","fountain","bench","sofa","bed","table","bookshelf","fireplace"].includes(obstacle);
}
export function canPlace(scene:Scene,x:number,y:number,id:DecorId):boolean {
  const item=ITEMS.find(item=>item.id===id);
  if(!item||(item.scene!=="both" && item.scene!==scene))return false;
  if(!inside(x,y))return false;
  if(scene==="garden")return !isHouse(x,y)&&!isWater(x,y)&&!(x===13&&y===13);
  return x>=5&&x<=22&&y>=4&&y<=17 && !(x===13 && y>=15);
}
export function initialWorld():WorldDoc {
  return {version:2,name:"Nuestro rincón",garden:{
    "4,4":"tree","23,4":"tree","6,14":"rosebush","7,14":"flowers",
    "19,7":"sunflower","6,9":"bench","19,10":"lamp","8,17":"plant"
  },home:{"8,7":"sofa","15,6":"bed","10,12":"rug","18,10":"bookshelf","20,16":"plant"}};
}
export function parseWorld(input:unknown):WorldDoc {
  const base=initialWorld();
  if(!input || typeof input!=="object" || Array.isArray(input))return base;
  const data=input as Record<string,unknown>;
  const parseDecor=(raw:unknown,scene:Scene)=>{
    const out:Record<string,DecorId>={};
    if(!raw || typeof raw!=="object" || Array.isArray(raw))return out;
    for(const [pos,val] of Object.entries(raw).slice(0,400)){
      const match=/^(\d{1,2}),(\d{1,2})$/.exec(pos);
      if(!match)continue;
      const [x,y]=[Number(match[1]),Number(match[2])];
      const id=(typeof val==="string"?(oldIds[val] || val):"") as DecorId;
      if(ids.has(id)&&canPlace(scene,x,y,id))out[pointKey(x,y)]=id;
    }
    return out;
  };
  const name=typeof data["name"]==="string" ? data["name"].slice(0,48):base.name;
  // Migration from the original emoji-only grid, preserving existing objects.
  if(data["version"]!==2 && data["furniture"])return {...base,name,garden:parseDecor(data["furniture"],"garden")};
  return {version:2,name,garden:parseDecor(data["garden"],"garden"),home:parseDecor(data["home"],"home")};
}
export function findPath(scene:Scene,start:Point,target:Point,decor:Record<string,DecorId>):Point[] {
  if(!canWalk(scene,target.x,target.y,decor))return [];
  const queue:Point[]=[start], found=new Set([pointKey(start.x,start.y)]);
  const parent=new Map<string,string>();
  let i=0;
  while(i<queue.length){
    const p=queue[i++];
    if(!p)break;
    const id=pointKey(p.x,p.y);
    if(id===pointKey(target.x,target.y)){
      const path:Point[]=[];
      let next=id;
      while(next!==pointKey(start.x,start.y)){
        const [x=0,y=0]=next.split(",").map(Number);
        path.unshift({x,y});
        next=parent.get(next)!;
      }
      return path;
    }
    for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]] as const){
      const x=p.x+dx,y=p.y+dy,k=pointKey(x,y);
      if(!found.has(k)&&canWalk(scene,x,y,decor)){
        found.add(k);parent.set(k,id);queue.push({x,y});
      }
    }
  }
  return [];
}
