import { useEffect, useRef } from "react";
import {
  TILE,WORLD_W,WORLD_H,pointKey,isWater,isHouse,
  type Scene,type Skin,type HairStyle,type Emote,type Point,type DecorId
} from "@/lib/couple-world";

type Player={id:string;x:number;y:number;skin:Skin;hair:HairStyle;emote?:Emote|null;name:string};
type Props={
  scene:Scene; decor:Record<string,DecorId>; hero:Point; skin:Skin;hair:HairStyle;emote?:Emote|null;
  partner?:Player; editing:boolean; night:boolean; onTile:(p:Point)=>void;
};
type Ctx=CanvasRenderingContext2D;
const C=(ctx:Ctx,color:string,x:number,y:number,w:number,h:number)=>{
  ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
};
function noise(x:number,y:number,seed=0){
  let n=(x*374761393+y*668265263+seed*1664525)|0;
  n=(n^(n>>>13))*1274126177;
  return ((n^(n>>>16))>>>0)%1000;
}
function ground(ctx:Ctx,x:number,y:number,scene:Scene,night:boolean,t:number){
  const X=x*TILE,Y=y*TILE,r=noise(x,y);
  if(scene==="home"){
    const plank=(x+y)%3===0?"#bb8d70":"#c79b7b";
    C(ctx,plank,X,Y,24,24);
    C(ctx,"#a87e66",X,Y+22,24,2);
    if(y===3)C(ctx,"#aa8068",X,Y,24,3);
    if(x===4||x===23)C(ctx,"#9d715d",X,Y,3,24);
    if(y<3||x<4||x>23||y>18){
      C(ctx,y<3?"#b98a79":"#936c5b",X,Y,24,24);
      if(y===2)C(ctx,"#6e4d55",X,Y+19,24,5);
      if((x===7||x===19)&&y===1){
        C(ctx,"#fff0bf",X+4,Y+3,16,16);C(ctx,"#8db0bd",X+6,Y+5,12,12);
        C(ctx,"#705465",X+11,Y+4,2,14);
      }
    }
    if((x+y)%7===0&&y>3&&y<17)C(ctx,"#fff4d0",X+3,Y+3,2,2);
    return;
  }
  const grass=r%3===0?"#83b56d":r%3===1?"#79ac67":"#8abb76";
  C(ctx,grass,X,Y,24,24);
  if(r%5===0){C(ctx,"#57965d",X+4,Y+8,2,5);C(ctx,"#c5d892",X+6,Y+11,2,2);}
  if(r%9===0){C(ctx,"#e9d3bd",X+16,Y+15,3,3);C(ctx,"#eaa8aa",X+17,Y+13,2,2);}
  if(x>=12&&x<=14&&y>=13){C(ctx,(x+y)%2?"#eacaa0":"#dfbe95",X,Y,24,24);C(ctx,"#d4b48b",X+3,Y+5,8,3);}
  if(y===0||y===WORLD_H-1||x===0||x===WORLD_W-1){
    if((x+y)%2===0){C(ctx,"#8a7259",X,Y+9,24,6);C(ctx,"#ddba85",X+9,Y+1,5,22);}
  }
  if(isWater(x,y)){
    C(ctx,"#4c9fbd",X,Y,24,24);
    C(ctx,"#79d2d7",X+4+(Math.floor(t/800)%3),Y+8,8,2);
    C(ctx,"#80d4c8",X+11,Y+18,7,2);
  }
}
function house(ctx:Ctx){
  const x=10*TILE,y=6*TILE,w=8*TILE,h=7*TILE;
  // Building silhouette and pixel roof; foreground facade.
  C(ctx,"#564853",x-10,y+20,w+20,h-12);
  C(ctx,"#f0d4ad",x,y+32,w,h-37);
  for(let i=0;i<8;i++) {
    C(ctx,i%2?"#ab5365":"#96465d",x+i*TILE-4,y+8,TILE+8,25);
    C(ctx,"#7c3b50",x+i*TILE,y+6,TILE,4);
  }
  C(ctx,"#6d3a51",x-17,y+24,w+34,10);
  C(ctx,"#ab5268",x-10,y+14,w+20,10);
  C(ctx,"#e5b5a0",x+3,y+45,w-6,h-52);
  for(const ix of [1,6]){
    C(ctx,"#8d5962",x+ix*TILE-1,y+70,28,32);
    C(ctx,"#bce0e0",x+ix*TILE+3,y+74,20,23);
    C(ctx,"#eff5de",x+ix*TILE+12,y+75,3,21);
    C(ctx,"#8d5962",x+ix*TILE+2,y+85,22,3);
  }
  C(ctx,"#784658",x+3*TILE+8,y+103,33,64);
  C(ctx,"#ad6d67",x+3*TILE+11,y+108,27,59);
  C(ctx,"#f8d9a7",x+3*TILE+34,y+139,4,4);
  C(ctx,"#594d54",x+3*TILE+6,y+160,37,7);
  C(ctx,"#f0bdcb",x+4*TILE-4,y+49,9,7);
  C(ctx,"#f0bdcb",x+4*TILE+5,y+45,9,11);
  C(ctx,"#f0bdcb",x+4*TILE+14,y+49,9,7);
}
function drawDecor(ctx:Ctx,id:DecorId,x:number,y:number,t:number){
  const X=x*TILE,Y=y*TILE;
  const b=(c:string,dx:number,dy:number,w:number,h:number)=>C(ctx,c,X+dx,Y+dy,w,h);
  // Each object is an authored low-resolution pixel sprite, never a font emoji.
  switch(id){
    case "tree":
      b("#715642",9,10,6,14);b("#4c8558",4,1,16,13);b("#62a866",2,5,20,11);
      b("#83c87b",5,3,12,5);b("#3c7456",15,12,6,4);break;
    case "flowers": case "rosebush": case "sunflower":
      b("#3c8a62",11,10,3,14);b("#48a45f",5,15,7,4);b("#48a45f",12,17,8,4);
      if(id==="sunflower"){b("#f7c853",5,3,15,13);b("#8b5f3f",10,7,6,6);}
      else if(id==="rosebush"){b("#c54e72",5,5,8,8);b("#f69ab3",12,2,9,9);b("#a33a62",7,9,9,6);}
      else{b("#eeacc8",5,4,6,7);b("#f7d5a1",8,6,3,3);b("#cb75a0",13,8,7,7);}
      break;
    case "bench":
      b("#845948",2,12,20,5);b("#b87958",2,5,20,7);b("#67493d",4,16,3,8);b("#67493d",18,16,3,8);break;
    case "lamp":
      b("#5b6175",10,8,4,16);b("#4c435d",5,4,14,4);
      b("#f7db94",7,0,10,10);b("#fff5c7",9,2,6,6);break;
    case "fountain":
      b("#6f9aa3",1,17,22,5);b("#78cbd5",3,13,18,6);b("#d9e9df",10,2,4,12);
      b("#5eafbe",5,7,14,5);break;
    case "plant":
      b("#b7795f",6,14,12,9);b("#cd9770",8,17,8,4);b("#3e8d60",10,3,5,13);
      b("#69b86b",4,6,9,8);b("#58a961",12,2,8,10);break;
    case "gift":
      b("#e99aab",3,6,18,17);b("#fff1ca",10,6,4,17);b("#a85883",3,9,18,3);
      b("#f7d2cf",6,2,12,6);break;
    case "heart":
      b("#d95d85",3,7,8,8);b("#d95d85",13,7,8,8);b("#f398ac",7,11,11,9);
      b("#d95d85",9,18,6,4);break;
    case "cat":
      b("#d9ad85",4,9,17,11);b("#c18b6c",5,3,5,9);b("#c18b6c",16,3,5,9);
      b("#3b4351",9,12,2,2);b("#3b4351",16,12,2,2);
      b("#ffdfb5",6,19,4,4);break;
    case "sofa":
      b("#aa6d83",1,6,22,15);b("#e2a9b6",3,9,18,9);
      b("#875765",1,15,4,9);b("#875765",19,15,4,9);break;
    case "bed":
      b("#856b6e",2,3,20,20);b("#f3e1ce",4,5,16,6);b("#cc89a0",4,12,16,9);
      b("#e5a4b0",8,14,7,5);break;
    case "table":
      b("#705745",5,16,4,8);b("#705745",17,16,4,8);b("#ae8060",2,9,20,9);
      b("#e4b58d",3,7,18,6);b("#faf0cc",10,4,5,6);break;
    case "bookshelf":
      b("#805949",2,1,20,22);b("#a57a60",5,3,14,17);
      ["#b45d74","#e4b46b","#7ba19b","#925e87"].forEach((v,i)=>b(v,6+i*3,6,3,13));
      b("#805949",4,13,16,3);break;
    case "rug":
      b("#ab7397",1,5,22,16);b("#f7d5cc",4,8,16,10);b("#d492a8",9,10,6,6);break;
    case "fireplace":
      b("#8d7773",2,1,20,22);b("#554d51",5,8,14,16);
      b("#ef955c",8,15,9,8);b("#f8db83",12,10,4,12);break;
    case "chair":
      b("#9c715b",6,3,12,7);b("#b68a65",5,11,14,6);
      b("#755945",7,17,3,7);b("#755945",15,17,3,7);break;
  }
}
function avatar(ctx:Ctx,x:number,y:number,skin:Skin,t:number,partner=false,hair:HairStyle="short",emote:Emote|null=null){
  const X=x*TILE,Y=y*TILE;
  const shirt={rose:"#e6789d",mint:"#63b8aa",lavender:"#a38bd4",gold:"#e6af5f"}[skin];
  const bob=Math.floor(t/230)%2;
  C(ctx,"#3d5260",X+7,Y+18+bob,4,5);C(ctx,"#3d5260",X+14,Y+18-bob,4,5);
  C(ctx,shirt,X+6,Y+11,13,10);
  C(ctx,"#f2ba91",X+9,Y+5,9,9);
  C(ctx,partner?"#483a5a":"#59414a",X+8,Y+3,11,5);
  C(ctx,partner?"#483a5a":"#59414a",X+7,Y+5,3,6);
  const hairColor=partner?"#4c354b":"#674756";
  if(hair==="long"){C(ctx,hairColor,X+6,Y+6,4,11);C(ctx,hairColor,X+18,Y+6,4,11);}
  if(hair==="curly"){C(ctx,hairColor,X+6,Y+3,5,5);C(ctx,hairColor,X+14,Y+2,6,6);C(ctx,hairColor,X+8,Y+1,8,4);}
  if(hair==="cap"){C(ctx,"#eac17b",X+6,Y+3,16,6);C(ctx,"#b56f84",X+10,Y+1,9,4);}
  if(emote==="heart"){C(ctx,"#f17598",X+9,Y-13,5,6);C(ctx,"#f17598",X+16,Y-13,5,6);C(ctx,"#fc9eb4",X+12,Y-8,7,5);C(ctx,"#f17598",X+14,Y-3,3,3);}
  if(emote==="wave"){C(ctx,"#f1bb89",X+22,Y-10,5,10);C(ctx,"#f1bb89",X+20,Y-6,8,5);C(ctx,"#fff1ce",X+20,Y-13,3,4);}
  if(emote==="dance"){C(ctx,"#ffe5a3",X+5,Y-13,4,4);C(ctx,"#ffe5a3",X+22,Y-9,4,4);C(ctx,"#fff0ca",X+16,Y-15,3,3);}
  C(ctx,"#33394a",X+11,Y+10,2,2);C(ctx,"#33394a",X+16,Y+10,2,2);
  C(ctx,"#f2ba91",X+4,Y+13,3,7);C(ctx,"#f2ba91",X+19,Y+13,3,7);
  C(ctx,"#fff5f1",X+12,Y+15,3,2);
}
export function WorldCanvas({scene,decor,hero,skin,hair,emote,partner,editing,night,onTile}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const smoothPeer=useRef({id:"",x:0,y:0});
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx)return;
    ctx.imageSmoothingEnabled=false;
    let frame=0,animation=0;
    function paint(t:number){
      if(!ctx)return;
      if(t-frame>=45){
        frame=t;
        C(ctx,"#416d67",0,0,WORLD_W*TILE,WORLD_H*TILE);
        for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++)ground(ctx,x,y,scene,night,t);
        if(scene==="garden")house(ctx);
        for(const [where,id] of Object.entries(decor)){
          const [x,y]=where.split(",").map(Number);
          if(Number.isInteger(x)&&Number.isInteger(y))drawDecor(ctx,id,x,y,t);
        }
        if(scene==="home"){
          C(ctx,"#b88e7d",13*TILE,18*TILE,24,24);
          C(ctx,"#e8c9a8",13*TILE+4,18*TILE+2,16,22);
        }
        if(scene==="garden") {
          C(ctx,"#eec6a1",13*TILE+4,13*TILE+3,16,10);
          C(ctx,"#c77f86",13*TILE+8,13*TILE+1,8,4);
        }
        if(partner&&partner.x>=0&&partner.y>=0){
          const ghost=smoothPeer.current;
          if(ghost.id!==partner.id || Math.hypot(ghost.x-partner.x,ghost.y-partner.y)>7){
            ghost.x=partner.x;ghost.y=partner.y;ghost.id=partner.id;
          }else{
            ghost.x+=(partner.x-ghost.x)*0.25;
            ghost.y+=(partner.y-ghost.y)*0.25;
          }
          avatar(ctx,ghost.x,ghost.y,partner.skin,t,true,partner.hair,partner.emote);
        }
        avatar(ctx,hero.x,hero.y,skin,t,false,hair,emote);
        if(night){
          C(ctx,"rgba(23,32,85,.22)",0,0,WORLD_W*TILE,WORLD_H*TILE);
          for(let i=0;i<24;i++){
            const x=noise(i,4)*WORLD_W*TILE/1000,y=noise(i,9)*WORLD_H*TILE/1000;
            C(ctx,"#f6e7b6",x,y,2,2);
          }
        }
        if(editing){
          C(ctx,"rgba(250,232,194,.38)",hero.x*TILE,hero.y*TILE,TILE,2);
        }
      }
      animation=requestAnimationFrame(paint);
    }
    animation=requestAnimationFrame(paint);
    return()=>cancelAnimationFrame(animation);
  },[scene,decor,hero.x,hero.y,skin,hair,emote,partner?.id,partner?.x,partner?.y,partner?.skin,partner?.hair,partner?.emote,editing,night]);
  return <canvas
    ref={canvasRef} width={WORLD_W*TILE} height={WORLD_H*TILE}
    className="block h-auto w-full min-w-[560px] cursor-crosshair rounded-xl border-4 border-[#725d62] shadow-2xl sm:min-w-0"
    style={{imageRendering:"pixelated",touchAction:"manipulation"}}
    role="img" aria-label="Mundo virtual 2D interactivo. Usa el teclado o los controles para moverte."
    onPointerDown={event=>{
      const rect=event.currentTarget.getBoundingClientRect();
      const x=Math.floor((event.clientX-rect.left)/rect.width*WORLD_W);
      const y=Math.floor((event.clientY-rect.top)/rect.height*WORLD_H);
      onTile({x,y});
    }}
  />;
}
