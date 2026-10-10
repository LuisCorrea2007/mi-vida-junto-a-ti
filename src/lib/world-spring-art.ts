/**
 * Original hand-coded spring pixel-art palette and sprites for Nuestro Mundo.
 * No images, sprites, or tiles are copied from another game.
 * Draws on a low-resolution canvas; caller sets imageSmoothingEnabled=false.
 */
import { TILE, WORLD_H, WORLD_W, isHouse, isWater, type DecorId, type Scene, type Skin, type HairStyle, type Emote } from "./couple-world";

type Ctx = CanvasRenderingContext2D;
type PlayerArt = {x:number;y:number;skin:Skin;hair:HairStyle;emote?:Emote|null;partner?:boolean};
const P={
  grass:"#91b77b", grassLight:"#a2c98b", grassDark:"#79a46c", grassShade:"#648d64",
  lilac:"#c3a1d6", lilacLight:"#e5c8e5", pink:"#e89db6", pinkLight:"#f9cddb",
  blush:"#d47698", gold:"#e8b876", wood:"#855a51", woodLight:"#bd8465",
  paleStone:"#e5cbb1", stone:"#bca59d", outline:"#554951",
  water:"#5c9eb6", waterLight:"#8ec6c7", waterDeep:"#417f9b",
};
function pix(ctx:Ctx,c:string,x:number,y:number,w:number,h:number){
  if(w<=0||h<=0)return;
  ctx.fillStyle=c;
  ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function seed(x:number,y:number,offset=0){
  let n=(x*16777619^y*2166136261^offset*1103515245)|0;
  n=Math.imul(n^(n>>>13),1274126177);
  return (n^(n>>>16))>>>0;
}
function flower(ctx:Ctx,x:number,y:number,c:string,scale=1){
  const q=(shade:string,xx:number,yy:number,w:number,h:number)=>pix(ctx,shade,x+xx*scale,y+yy*scale,w*scale,h*scale);
  q("#5b986d",2,5,2,4);q("#64a476",0,7,3,2);
  q(c,2,0,3,3);q(c,0,2,3,3);q(c,4,2,3,3);q(c,2,4,3,2);
  q("#fff0b9",3,3,2,2);
}
function grass(ctx:Ctx,x:number,y:number,t:number){
  const X=x*TILE,Y=y*TILE,n=seed(x,y);
  const colors=[P.grass,P.grassLight,"#8ab57a","#98bf84","#86ad74"];
  pix(ctx,colors[n%colors.length]??P.grass,X,Y,TILE,TILE);
  // Irregular clover, soft leaves, and spring wildflowers on a textured field.
  if(n%4===0){pix(ctx,"#7caa73",X+4,Y+8,3,2);pix(ctx,"#7fac6e",X+7,Y+6,2,4);pix(ctx,"#d1df9a",X+6,Y+5,2,2);}
  if(n%3===0){pix(ctx,"#b3d39a",X+16,Y+18,5,2);pix(ctx,"#699963",X+19,Y+16,2,3);}
  if(n%8===0)flower(ctx,X+11,Y+4,n%16===0?P.lilacLight:P.pinkLight,.7);
  if(n%17===0){pix(ctx,"#e1cbb3",X+5,Y+16,3,2);pix(ctx,"#f8e9d2",X+6,Y+16,2,1);}
  if(n%5===0){pix(ctx,"#b7cf96",X+2,Y+20,2,2);pix(ctx,"#719e66",X+3,Y+17,2,3);}
  if(n%9===0){pix(ctx,P.pinkLight,X+20,Y+2,3,2);pix(ctx,P.lilac,X+17,Y+4,2,2);}
  void t;
}
function isPath(x:number,y:number){
  if(y>=13 && x>=12 && x<=14) return true;
  if(y>=15 && y<=17 && x>=8 && x<=19) return Math.abs(y-16)<2+(seed(x,y)%2);
  if(y>=17 && x>=10 && x<=17)return true;
  if(y>=9 && y<=15 && x>=6 && x<=10)return Math.abs(y-(15-(x-6)))<=1;
  return false;
}
function pathTile(ctx:Ctx,x:number,y:number){
  const X=x*TILE,Y=y*TILE,n=seed(x,y,19);
  pix(ctx,n%3===0?"#b4a999":"#bdba9e",X,Y,TILE,TILE);
  for(let i=0;i<4;i++){
    const sx=(seed(x,i+y,12)%18)+1, sy=(seed(i+x,y,45)%19)+1;
    const w=6+(seed(x+i,y,13)%8),h=3+(seed(i,x+y,3)%5);
    pix(ctx,["#e5d4b4","#f2dec4","#cec1aa","#a6a58b"][seed(x+i,y)%4]!,X+sx-2,Y+sy-2,w,h);
    pix(ctx,"#a49d8c",X+sx-2,Y+sy+h-3,Math.max(2,w-3),2);
  }
  if(n%6===0){pix(ctx,P.pinkLight,X+4,Y+5,3,2);pix(ctx,P.lilacLight,X+8,Y+6,2,3);}
}
function waterTile(ctx:Ctx,x:number,y:number,t:number){
  const X=x*TILE,Y=y*TILE,n=seed(x,y,8),wave=Math.floor(t/260)%4;
  pix(ctx,n%3===0?P.waterDeep:P.water,X,Y,TILE,TILE);
  pix(ctx,"#72b1c2",X,Y,24,3);
  pix(ctx,P.waterLight,X+3+wave,Y+5,10,2);
  pix(ctx,"#a2d9d2",X+13-wave,Y+17,8,2);
  pix(ctx,"#497e9c",X+2,Y+13,13,2);
  if(n%6===0){
    pix(ctx,"#518d69",X+12,Y+9,9,5);pix(ctx,"#87b284",X+13,Y+9,7,3);
    if(n%12===0)flower(ctx,X+12,Y+5,P.pinkLight,.55);
  }
  if(n%8===0)pix(ctx,"#e1eeee",X+19,Y+3+(wave%2),2,2);
}
function coast(ctx:Ctx,x:number,y:number){
  const X=x*TILE,Y=y*TILE;
  const neighbors=[[0,-1],[0,1],[-1,0],[1,0]];
  for(const [dx,dy] of neighbors){
    const nx=x+dx,ny=y+dy;
    if(nx<0||ny<0||nx>=WORLD_W||ny>=WORLD_H||!isWater(nx,ny))continue;
    if(dy===1){pix(ctx,"#708c7b",X,Y+19,TILE,5);pix(ctx,"#d7c5a9",X+3,Y+18,7,4);pix(ctx,"#aba79a",X+15,Y+19,8,4);}
    if(dy===-1){pix(ctx,"#6d8878",X,Y,TILE,5);pix(ctx,"#ddcab0",X+2,Y+1,9,3);}
    if(dx===1){pix(ctx,"#6e8a79",X+19,Y,5,TILE);pix(ctx,"#d9c9aa",X+20,Y+5,4,10);}
    if(dx===-1){pix(ctx,"#6e8a79",X,Y,5,TILE);pix(ctx,"#d9c9aa",X+1,Y+3,4,9);}
  }
}
function fence(ctx:Ctx,x:number,y:number,vertical=false){
  const X=x*TILE,Y=y*TILE;
  if(vertical){
    pix(ctx,"#634a46",X+9,Y+2,5,23);pix(ctx,"#b98766",X+11,Y,4,22);
    pix(ctx,"#7a5a4e",X+6,Y+8,12,4);pix(ctx,"#d3a178",X+8,Y+9,10,2);
  }else{
    pix(ctx,"#845b49",X,Y+10,24,4);pix(ctx,"#b88b62",X,Y+9,24,2);
    pix(ctx,"#845b49",X,Y+19,24,4);pix(ctx,"#cca078",X,Y+18,24,2);
    pix(ctx,"#674c43",X+2,Y+3,6,21);pix(ctx,"#d9ab7e",X+4,Y+4,3,18);
    pix(ctx,"#8c6151",X+1,Y+2,8,3);
  }
}
function indoorTile(ctx:Ctx,x:number,y:number){
  const X=x*TILE,Y=y*TILE,n=seed(x,y);
  const wall=y<3||x<4||x>23||y>18;
  if(wall){
    pix(ctx,y<3?"#e8c5c3":"#cda89e",X,Y,24,24);
    pix(ctx,"#bc9295",X,Y+22,24,2);
    if(n%5===0){pix(ctx,"#f1d8ce",X+11,Y+4,2,5);pix(ctx,"#d7a7af",X+11,Y+8,3,3);}
    if(y===2){pix(ctx,"#8f6b6b",X,Y+20,24,4);}
    if(x===4||x===23)pix(ctx,"#ac8479",X+2,Y,3,24);
    if(y===1&&(x===8||x===18)){
      pix(ctx,"#715968",X-4,Y+2,32,22);pix(ctx,"#9dc5c9",X,Y+4,24,16);
      pix(ctx,"#fce5b7",X+11,Y+4,4,16);
      pix(ctx,"#e5bbc1",X-5,Y+2,8,23);pix(ctx,"#e5bbc1",X+20,Y+2,8,23);
    }
  }else{
    pix(ctx,(x+y)%2===0?"#dcb99d":"#e0c3a3",X,Y,24,24);
    pix(ctx,"#c29b83",X,Y+22,24,2);
    pix(ctx,"#f0d4b9",X,Y+1,24,2);
    if((x*7+y)%6===0)pix(ctx,"#c7a990",X+7,Y+9,5,2);
  }
}
export function drawSpringTerrain(ctx:Ctx,scene:Scene,t:number,night:boolean){
  const W=WORLD_W*TILE,H=WORLD_H*TILE;
  pix(ctx,scene==="garden"?"#8bb477":"#d5afa7",0,0,W,H);
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
    if(scene==="home")indoorTile(ctx,x,y);
    else if(isWater(x,y))waterTile(ctx,x,y,t);
    else {
      grass(ctx,x,y,t);
      if(isPath(x,y)&&!isHouse(x,y))pathTile(ctx,x,y);
      coast(ctx,x,y);
    }
  }
  if(scene==="garden"){
    // Hand-built fence, orchard corners, and clipped spring borders.
    for(let x=1;x<WORLD_W-1;x++){
      if(x>10&&x<18)continue;
      fence(ctx,x,1);
      if((x<7||x>19)&&x%2===0)fence(ctx,x,WORLD_H-2);
    }
    for(let y=2;y<WORLD_H-3;y+=2){fence(ctx,1,y,true);if(y<12)fence(ctx,WORLD_W-2,y,true);}
    // Wooden garden patch beside the house.
    for(let x=19;x<=25;x++)for(let y=7;y<=11;y++){
      if(y%2===0){pix(ctx,"#96684f",x*TILE+2,y*TILE+5,20,15);pix(ctx,"#b98961",x*TILE+3,y*TILE+7,18,3);}
      const r=seed(x,y,77);
      if(r%3===0)flower(ctx,x*TILE+8,y*TILE+6,r%2?P.pinkLight:P.lilacLight,1);
      if(r%3===1){pix(ctx,"#4e9862",x*TILE+10,y*TILE+7,4,12);pix(ctx,"#88be7a",x*TILE+5,y*TILE+9,13,4);}
    }
    // Handcrafted pixel dock on the bottom-right edge of the pond.
    for(let y=14;y<=17;y++)for(let x=19;x<=20;x++){
      if(isWater(x,y))continue;
      pix(ctx,"#754d46",x*TILE,y*TILE+4,24,18);
      for(let k=0;k<4;k++){pix(ctx,"#c38e67",x*TILE+2+k*6,y*TILE+4,4,16);}
    }
    springHouse(ctx,t);
    // Tiny mail box near the pathway.
    const bx=15*TILE,by=14*TILE;
    pix(ctx,"#634b50",bx+10,by+8,4,15);pix(ctx,"#ad6f7d",bx+4,by+2,16,10);
    pix(ctx,"#f5d4cf",bx+7,by+6,10,3);pix(ctx,"#b65375",bx+11,by+6,3,2);
  }else{
    // Cozy room rugs, shelves and flowering wallpaper.
    for(let x=7;x<20;x++)for(let y=7;y<15;y++){
      const X=x*TILE,Y=y*TILE;
      if(x===7||x===19||y===7||y===14)pix(ctx,"#af819d",X,Y,24,24);
      else pix(ctx,(x+y)%2===0?"#e2b2b2":"#e5bebe",X,Y,24,24);
      if(seed(x,y)%9===0)pix(ctx,"#f8d9cd",X+7,Y+8,9,7);
    }
    for(let x=5;x<=22;x++){
      if(x%3===0)flower(ctx,x*TILE+8,3*TILE-2,x%2?P.lilacLight:P.pinkLight,.5);
    }
  }
  if(night){
    ctx.fillStyle="rgba(36,40,85,.26)";ctx.fillRect(0,0,W,H);
    const lamps=scene==="garden"?[[8,6],[18,14],[9,15]]:[[13,8],[8,6],[18,6]];
    for(const [lx,ly] of lamps){
      const X=lx*TILE,Y=ly*TILE;
      const glow=ctx.createRadialGradient(X,Y,1,X,Y,85);
      glow.addColorStop(0,"rgba(255,217,143,.38)");glow.addColorStop(1,"rgba(255,217,143,0)");
      ctx.fillStyle=glow;ctx.fillRect(X-85,Y-85,170,170);
    }
  }
}
function springHouse(ctx:Ctx,t:number){
  const X=10*TILE,Y=6*TILE,w=8*TILE,h=7*TILE;
  pix(ctx,"#617861",X-15,Y+32,w+35,h-12);
  pix(ctx,"#775c58",X-8,Y+26,w+19,h-24);
  pix(ctx,"#cba58e",X,Y+39,w,h-39);
  for(let i=0;i<8;i++){
    const xx=X+i*TILE;
    pix(ctx,i%2===0?"#d2b69b":"#e2c9a6",xx,Y+55,TILE,28);
    pix(ctx,"#b58a7c",xx,Y+53,2,35);
  }
  // Gable roof with pixel-step silhouette and handcrafted terra-cotta shingles.
  for(let row=0;row<5;row++){
    pix(ctx,"#694a54",X-14+row*11,Y+35-row*9,w+27-row*22,13);
    pix(ctx,row%2?"#a26360":"#b86e68",X-11+row*11,Y+31-row*9,w+22-row*22,12);
  }
  for(let iy=0;iy<4;iy++)for(let ix=0;ix<9;ix++){
    const x=X-5+ix*22+(iy%2)*10,y=Y+9+iy*9;
    pix(ctx,(ix+iy)%2?"#d98e75":"#c67d6e",x,y,19,3);
    pix(ctx,"#825a57",x,y+4,13,2);
  }
  // Chimney
  pix(ctx,"#705864",X+150,Y-57,28,42);
  pix(ctx,"#b18e81",X+154,Y-52,20,34);
  pix(ctx,"#6b5355",X+149,Y-60,30,8);
  const smoke=Math.floor(t/370)%4;
  pix(ctx,"#d5d1c9",X+159-smoke,Y-81,10,9);
  pix(ctx,"#e2dbcf",X+166-smoke,Y-97,15,11);
  pix(ctx,"#eae2da",X+161-smoke,Y-112,11,7);
  // Windows and shutters.
  for(const wx of [28,137]){
    pix(ctx,"#6f565b",X+wx-7,Y+65,43,41);
    pix(ctx,"#b98b73",X+wx-2,Y+69,32,34);
    pix(ctx,"#fce7b2",X+wx+2,Y+73,24,25);
    pix(ctx,"#9aabb0",X+wx+12,Y+73,3,25);
    pix(ctx,"#bb806e",X+wx,Y+85,28,3);
    pix(ctx,"#a26e63",X+wx-11,Y+69,7,35);
    pix(ctx,"#a26e63",X+wx+31,Y+69,8,35);
    pix(ctx,"#d1a080",X+wx+3,Y+107,27,4);
  }
  // Arched door in centre, heart inlay.
  const D=X+83;
  pix(ctx,"#5e4754",D-2,Y+70,33,94);
  pix(ctx,"#a56a5b",D+2,Y+75,25,87);
  pix(ctx,"#c99067",D+6,Y+80,17,77);
  pix(ctx,"#e5bc84",D+18,Y+124,4,4);
  pix(ctx,P.blush,D+9,Y+99,5,6);pix(ctx,P.blush,D+17,Y+99,5,6);
  pix(ctx,P.pinkLight,D+12,Y+105,8,6);pix(ctx,P.blush,D+14,Y+110,4,4);
  // Warm lanterns.
  for(const lx of [70,121]){
    pix(ctx,"#4e444c",X+lx,Y+69,4,38);
    pix(ctx,"#f5c77f",X+lx-3,Y+78,10,14);
    pix(ctx,"#fff1c2",X+lx,Y+80,5,8);
    pix(ctx,"#5d4a56",X+lx-5,Y+74,14,4);
  }
  // Flowering vines cascading across the façade.
  for(let i=0;i<30;i++){
    const n=seed(i,6,47);
    const vx=X+(n%177),vy=Y+36+(seed(i,8)%73);
    if(vx>D-12 && vx<D+39 && vy>Y+76)continue;
    if(i%2===0)pix(ctx,"#5e986f",vx,vy,3,6);
    flower(ctx,vx,vy,i%3?P.pinkLight:P.lilac,0.65);
  }
  // Door steps
  pix(ctx,"#94867d",D-13,Y+157,55,8);
  pix(ctx,"#d8c0a5",D-11,Y+158,51,5);
  pix(ctx,"#8f7771",D-20,Y+164,70,4);
}
export function drawSpringDecor(ctx:Ctx,id:DecorId,x:number,y:number,t:number){
  const X=x*TILE,Y=y*TILE;
  const b=(c:string,dx:number,dy:number,w:number,h:number)=>pix(ctx,c,X+dx,Y+dy,w,h);
  const shadow=()=>{b("rgba(60,73,60,.3)",0,19,26,6);};
  const blossom=(xx:number,yy:number,shade:string)=>{
    pix(ctx,"#bc7498",X+xx-2,Y+yy+3,11,4);
    pix(ctx,shade,X+xx,Y+yy,9,6);
    pix(ctx,"#ffe6e1",X+xx+4,Y+yy+2,3,2);
  };
  switch(id){
    case "tree":{
      // Oversized sakura tree with several depth-shaded blossom clusters.
      shadow();b("#654b53",9,-12,9,37);b("#a06c60",12,-14,3,31);
      b("#668b69",0,-35,35,24);
      const palette=[P.lilac,"#b88ec4",P.pink,P.pinkLight,P.lilacLight,"#ddb0d5"];
      for(let i=0;i<24;i++){
        const nx=(seed(i,x,4)%44)-10,ny=(seed(i,y,9)%33)-48;
        const c=palette[(i+seed(x,y))%palette.length]!;
        b("#a27791",nx+2,ny+4,12,7);b(c,nx,ny,15,8);b(c,nx+3,ny-3,10,5);
        if(i%4===0)b("#f8e5e5",nx+4,ny+1,3,2);
      }
      break;
    }
    case "flowers":case "rosebush":case "sunflower":{
      shadow();
      b("#438861",10,7,3,16);b("#63a669",5,13,10,4);b("#649e67",12,17,8,4);
      if(id==="sunflower"){
        for(const [dx,dy] of [[9,0],[4,5],[14,5],[9,10]])b("#f4cb68",dx,dy,11,8);
        b("#99684f",11,4,7,8);b("#f9e6a1",11,4,3,2);
      }else if(id==="rosebush"){
        blossom(1,2,P.blush);blossom(11,-4,P.pink);blossom(7,9,P.pinkLight);
      }else{
        flower(ctx,X+1,Y+5,P.pinkLight,.85);
        flower(ctx,X+11,Y+0,P.lilacLight,.85);
        flower(ctx,X+8,Y+10,"#ffffff",.7);
      }
      break;
    }
    case "bench":
      shadow();b("#644c4d",1,16,23,5);b("#9b6b5b",1,6,22,9);
      for(let i=0;i<3;i++)b(i%2?"#bd8569":"#d2a481",3,7+i*3,18,2);
      b("#75564d",3,18,4,6);b("#75564d",18,18,4,6);
      b(P.blush,9,8,5,4);b(P.pinkLight,12,10,5,4);break;
    case "lamp":
      b("rgba(55,48,65,.3)",4,22,16,3);
      b("#61545f",10,5,5,18);b("#a57d70",12,5,2,17);
      b("#524b5c",5,1,15,5);b("#f1ca88",7,-8,11,13);
      b("#fff3ba",10,-6,5,9);b("#59485d",6,-11,13,4);
      b("#5b4a56",7,7,11,3);
      if(t%2600<1800)flower(ctx,X+3,Y+17,P.pink,.4);
      break;
    case "fountain":
      shadow();b("#879d9c",0,17,24,6);b("#bfc2b1",2,14,20,4);
      b("#5ba5bc",4,14,16,4);b("#71979c",11,2,4,13);
      b("#bee6d9",11,-4,3,11);b("#8fcfd1",7,7,11,3);
      b("#9ed7d6",8+Math.floor(t/280)%4,10,5,2);break;
    case "plant":
      shadow();b("#ac785f",4,14,17,9);b("#d9a07e",7,16,11,4);
      b("#4e8e64",11,0,4,15);b("#6aaa71",1,3,11,10);
      b("#84bc83",15,-2,7,10);b("#37785d",17,6,7,6);
      flower(ctx,X+11,Y-3,P.pinkLight,.5);break;
    case "gift":
      shadow();b("#ca7c94",2,5,20,17);b("#efa6b6",4,7,16,12);
      b("#fff1d7",10,5,4,17);b("#a8557a",3,10,18,3);
      b(P.pinkLight,7,-1,11,7);break;
    case "cat":
      shadow();b("#d3a17c",3,10,19,10);b("#b7806d",4,2,5,11);
      b("#b7806d",17,2,5,11);b("#ffcf9c",6,9,13,9);
      b("#4b4550",9,11,2,2);b("#4b4550",17,11,2,2);
      b(P.pink,13,15,3,2);b("#fce6c5",6,20,4,3);break;
    case "heart":
      shadow();b(P.blush,3,5,9,8);b(P.blush,13,5,9,8);
      b(P.pinkLight,6,9,14,10);b(P.blush,9,17,8,5);break;
    case "sofa":
      shadow();b("#aa708b",0,3,24,20);b("#e5acc0",3,6,18,14);
      b("#be819b",1,15,5,9);b("#be819b",18,15,5,9);
      b(P.pinkLight,11,10,7,6);break;
    case "bed":
      shadow();b("#7a6461",0,1,24,22);b("#f9e8d4",3,4,18,7);
      b("#d994ab",3,13,18,8);b(P.lilacLight,9,15,8,5);
      b("#fff7ea",4,6,7,5);break;
    case "table":
      shadow();b("#7c5c51",4,15,4,9);b("#7c5c51",18,15,4,9);
      b("#ab785e",1,7,22,12);b("#d7a37b",2,5,20,8);
      b("#f8e4ca",10,2,5,5);b(P.pinkLight,8,3,3,3);break;
    case "bookshelf":
      b("#704c4a",1,-1,22,24);b("#b4896d",4,2,16,19);
      ["#cd8aa4","#e4bd89","#8bb5b0","#b39dc5"].forEach((c,i)=>b(c,5+i*4,4,3,14));
      b("#76504a",4,12,16,3);break;
    case "rug":
      b("#b17c9e",1,6,22,16);b("#f0d4c4",4,8,16,12);
      b(P.blush,10,12,6,5);break;
    case "fireplace":
      b("#ad8c80",1,0,22,23);b("#615159",5,9,14,14);
      b("#e28d62",8,15,10,7);b("#f9d88a",13,10,4,10);break;
    case "chair":
      shadow();b("#966a58",6,2,12,9);b("#c99770",5,12,14,6);
      b("#71514b",6,17,4,7);b("#71514b",17,17,4,7);break;
  }
}
export function drawSpringCharacter(ctx:Ctx,p:PlayerArt,t:number){
  const X=p.x*TILE,Y=p.y*TILE;
  const shirt={rose:"#e5a1af",mint:"#77b6a0",lavender:"#b59ccd",gold:"#e2bb80"}[p.skin];
  const hair=p.partner?"#674c59":"#59444a",bob=Math.floor(t/210)%2;
  // Rounded silhouette built in tiny pixel blocks.
  pix(ctx,"rgba(56,54,59,.24)",X+5,Y+23,20,4);
  pix(ctx,"#5b5260",X+7,Y+18+bob,6,6);pix(ctx,"#5b5260",X+16,Y+18-bob,6,6);
  pix(ctx,"#f6d0a3",X+8,Y+3,14,13);pix(ctx,"#eebf9a",X+10,Y+6,10,8);
  pix(ctx,shirt,X+5,Y+14,19,8);pix(ctx,"#fff1e1",X+10,Y+14,8,4);
  pix(ctx,hair,X+7,Y+1,16,5);pix(ctx,hair,X+5,Y+5,5,10);
  if(p.hair==="long"){pix(ctx,hair,X+4,Y+7,4,15);pix(ctx,hair,X+23,Y+6,4,14);}
  if(p.hair==="curly"){pix(ctx,hair,X+4,Y+3,8,5);pix(ctx,hair,X+14,Y,10,6);}
  if(p.hair==="cap"){pix(ctx,"#d69aac",X+5,Y+2,20,5);pix(ctx,"#f7d5d7",X+6,Y+1,9,3);}
  pix(ctx,"#514550",X+11,Y+10,2,2);pix(ctx,"#514550",X+18,Y+10,2,2);
  pix(ctx,P.pink,X+10,Y+13,3,2);pix(ctx,P.pink,X+19,Y+13,3,2);
  pix(ctx,"#f5c59d",X+3,Y+16,4,6);pix(ctx,"#f5c59d",X+25,Y+16,4,6);
  if(p.emote){
    const cx=X+15,cy=Y-17-(Math.sin(t/240)+1)*2;
    pix(ctx,"#fff7eb",cx-10,cy-7,24,19);
    pix(ctx,"#b59ab5",cx-9,cy-8,22,2);
    if(p.emote==="heart"){
      pix(ctx,P.blush,cx-4,cy-3,7,6);pix(ctx,P.blush,cx+4,cy-3,7,6);
      pix(ctx,P.pinkLight,cx-1,cy+2,9,5);
    }else if(p.emote==="wave"){
      pix(ctx,"#eab68d",cx,cy-4,8,12);pix(ctx,"#a98167",cx+2,cy-3,2,9);
    }else{
      pix(ctx,"#aa8abd",cx-1,cy-3,5,11);pix(ctx,"#aa8abd",cx+4,cy-4,6,3);
      pix(ctx,P.blush,cx-5,cy+8,8,3);
    }
  }
}
