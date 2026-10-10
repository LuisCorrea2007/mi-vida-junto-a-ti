import { useEffect, useRef } from "react";
import {
  TILE, WORLD_W, WORLD_H, type Scene, type Skin, type HairStyle,
  type Emote, type Point, type DecorId
} from "@/lib/couple-world";
import { drawSpringTerrain, drawSpringDecor, drawSpringCharacter } from "@/lib/world-spring-art";

type Player = {id:string;x:number;y:number;skin:Skin;hair:HairStyle;emote?:Emote|null;name:string};
type Props = {
  scene:Scene; decor:Record<string,DecorId>; hero:Point; skin:Skin;hair:HairStyle;emote?:Emote|null;
  partner?:Player|undefined; editing:boolean; night:boolean; onTile:(p:Point)=>void;
};

/** Real-time, original cozy-spring canvas scene; gameplay/collisions live in couple-world.ts. */
export function WorldCanvas({scene,decor,hero,skin,hair,emote,partner,editing,night,onTile}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const smoothPeer=useRef({id:"",x:0,y:0});
  const smoothHero=useRef({x:hero.x,y:hero.y});
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx)return;
    ctx.imageSmoothingEnabled=false;
    let last=0,animation=0,active=true;
    // Layout and decorations are rendered separately from avatar animation.
    const decorEntries=Object.entries(decor)
      .map(([position,id])=>{
        const [x=0,y=0]=position.split(",").map(Number);
        return {x,y,id};
      })
      .filter(item=>Number.isInteger(item.x)&&Number.isInteger(item.y))
      .sort((a,b)=>a.y-b.y);
    const reduceMotion=typeof window!=="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function paint(t:number){
      if(!ctx||!active)return;
      if(t-last>= (reduceMotion?95:50)){
        last=t;
        const timestamp=reduceMotion?0:t;
        drawSpringTerrain(ctx,scene,timestamp,night);
        // Actors and scenery overlap by their position on the Y axis, like a top-down cozy RPG.
        const actors:{
          x:number;y:number;kind:"decor"|"hero"|"partner";
          id?:DecorId; skin?:Skin;hair?:HairStyle;emote?:Emote|null|undefined
        }[]=decorEntries.map(item=>({...item,kind:"decor" as const}));
        const local=smoothHero.current;
        if(Math.hypot(local.x-hero.x,local.y-hero.y)>5){local.x=hero.x;local.y=hero.y;}
        else {local.x+=(hero.x-local.x)*(reduceMotion?1:.32);local.y+=(hero.y-local.y)*(reduceMotion?1:.32);}
        actors.push({x:local.x,y:local.y,kind:"hero",skin,hair,emote});
        if(partner&&partner.x>=0&&partner.y>=0){
          const peer=smoothPeer.current;
          if(peer.id!==partner.id||Math.hypot(peer.x-partner.x,peer.y-partner.y)>7){
            peer.id=partner.id;peer.x=partner.x;peer.y=partner.y;
          }else {
            peer.x+=(partner.x-peer.x)*(reduceMotion?1:.26);
            peer.y+=(partner.y-peer.y)*(reduceMotion?1:.26);
          }
          actors.push({x:peer.x,y:peer.y,kind:"partner",skin:partner.skin,hair:partner.hair,emote:partner.emote});
        }
        actors.sort((a,b)=>a.y-b.y);
        for(const actor of actors){
          if(actor.kind==="decor"&&actor.id)drawSpringDecor(ctx,actor.id,actor.x,actor.y,timestamp);
          else if(actor.kind==="hero"||actor.kind==="partner"){
            drawSpringCharacter(ctx,{x:actor.x,y:actor.y,
              skin:actor.skin??"rose",hair:actor.hair??"short",emote:actor.emote??null,
              partner:actor.kind==="partner"},timestamp);
          }
        }
        if(editing){
          ctx.fillStyle="rgba(255,242,212,.25)";
          ctx.fillRect(hero.x*TILE,hero.y*TILE,TILE,TILE);
          ctx.strokeStyle="#fff2ce";ctx.lineWidth=1;
          ctx.strokeRect(hero.x*TILE+.5,hero.y*TILE+.5,TILE-1,TILE-1);
        }
        // Tiny drifting petals for a living spring atmosphere.
        if(scene==="garden"&&!reduceMotion){
          for(let n=0;n<16;n++){
            const x=((n*97+t/(65+n*3))%(WORLD_W*TILE));
            const y=((n*71+t/(110+n*2))%(WORLD_H*TILE));
            ctx.fillStyle=n%2?"#f9d3df":"#e5b9e3";
            ctx.fillRect(Math.floor(x),Math.floor(y),n%4===0?3:2,2);
          }
        }
      }
      animation=requestAnimationFrame(paint);
    }
    animation=requestAnimationFrame(paint);
    return()=>{active=false;cancelAnimationFrame(animation);};
  },[scene,decor,hero.x,hero.y,skin,hair,emote,partner?.id,partner?.x,partner?.y,partner?.skin,partner?.hair,partner?.emote,editing,night]);

  return <canvas
    ref={canvasRef} width={WORLD_W*TILE} height={WORLD_H*TILE}
    className="spring-world-canvas block h-auto w-full min-w-[560px] cursor-crosshair rounded-lg sm:min-w-0"
    style={{imageRendering:"pixelated",touchAction:"manipulation"}}
    role="img" aria-label="Mundo 2D de primavera con flores rosadas, una casa, estanque y personajes. Usa el teclado o los controles para moverte."
    onPointerDown={event=>{
      const rect=event.currentTarget.getBoundingClientRect();
      const x=Math.floor((event.clientX-rect.left)/rect.width*WORLD_W);
      const y=Math.floor((event.clientY-rect.top)/rect.height*WORLD_H);
      if(x>=0&&x<WORLD_W&&y>=0&&y<WORLD_H)onTile({x,y});
    }}
  />;
}
