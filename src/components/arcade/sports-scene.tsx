import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useAnimations, useGLTF } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider, BallCollider, useBeforePhysicsStep, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import boy from "@/assets/games/boy.glb.asset.json";
import girl from "@/assets/games/girl.glb.asset.json";
import palm from "@/assets/games/palm.glb.asset.json";
import rock from "@/assets/games/rock.glb.asset.json";
import { curlingScore, targetX, type Sport } from "@/lib/arcade-sports";

export type Shot = { id: number; angle: number; power: number; player: number; start: [number, number] };
export type ShotResult = { points: number; hole: boolean; x: number; z: number };
type Props = { sport: Sport; round: number; shot: Shot | null; paused: boolean; avatar: number; onReady: () => void; onFinish: (result: ShotResult) => void };
function Scenery({url,position,height}: {url:string;position:[number,number,number];height:number}) {
  const {scene}=useGLTF(url);
  const object=useMemo(()=>{const obj=scene.clone(true);const box=new THREE.Box3().setFromObject(obj);obj.scale.setScalar(height/Math.max(0.01,box.getSize(new THREE.Vector3()).y));const scaled=new THREE.Box3().setFromObject(obj);obj.position.y-=scaled.min.y;obj.traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true;});return obj;},[scene,height]);
  return <group position={position}><primitive object={object} /></group>;
}
type ColorName = "sky" | "mint" | "coral" | "yellow" | "ice" | "white" | "ink" | "wood" | "grass";
type Palette = Record<ColorName, string>;
function palette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const read = (name: ColorName) => css.getPropertyValue(`--arcade-${name}`).trim();
  return {sky:read("sky"),mint:read("mint"),coral:read("coral"),yellow:read("yellow"),ice:read("ice"),white:read("white"),ink:read("ink"),wood:read("wood"),grass:read("grass")};
}

function Character({ url, position, active }: { url: string; position: [number, number, number]; active: boolean }) {
  const { scene, animations } = useGLTF(url);
  const object = useMemo(() => {
    const obj = clone(scene);
    const bounds = new THREE.Box3().setFromObject(obj);
    obj.scale.setScalar(1.65 / Math.max(bounds.getSize(new THREE.Vector3()).y, 0.01));
    const scaled = new THREE.Box3().setFromObject(obj);
    obj.position.y -= scaled.min.y;
    obj.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = true; });
    return obj;
  }, [scene]);
  const group = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, group);
  useEffect(() => { const action = actions[active ? "emote-yes" : "idle"]; action?.reset().fadeIn(0.2).play(); return () => { action?.fadeOut(0.2); }; }, [actions, active]);
  return <group ref={group} position={position} rotation-y={0.3}><primitive object={object} /></group>;
}

function Surface({ sport, colors }: { sport: Sport; colors: Palette }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = colors[sport === "bowling" ? "wood" : sport === "curling" ? "ice" : sport === "basket" ? "coral" : "grass"] ?? ""; ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1500; i++) { ctx.globalAlpha = 0.08; ctx.fillStyle = colors.white; ctx.fillRect((Math.sin(i*127.1)*43758.5%1+1)%1*256, (Math.sin(i*311.7)*95123.3%1+1)%1*256, sport === "bowling" ? 1 : 2, sport === "bowling" ? 70 : 2); }
      ctx.globalAlpha = 0.5; ctx.strokeStyle = colors.white ?? ""; ctx.lineWidth = 2;
      if (sport === "bowling") for (let i = 0; i < 256; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke(); }
    }
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 5); return t;
  }, [sport, colors]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <RigidBody type="fixed" colliders={false} friction={sport === "curling" ? 0.05 : 0.5}>
    <CuboidCollider args={[3.4, 0.2, 7.7]} position={[0, -0.2, 0]} />
    <mesh position={[0, -0.2, 0]} receiveShadow><boxGeometry args={[6.8, 0.4, 15.4]} /><meshStandardMaterial map={texture} roughness={sport === "curling" ? 0.22 : 0.75} /></mesh>
    {[-3.5, 3.5].map(x => <group key={x}><CuboidCollider args={[0.15, 0.45, 7.8]} position={[x, 0.2, 0]} restitution={0.7} /><mesh position={[x, 0.2, 0]} castShadow><boxGeometry args={[0.3, 0.9, 15.6]} /><meshStandardMaterial color={colors.mint} /></mesh></group>)}
    <CuboidCollider args={[3.5, 0.45, 0.15]} position={[0, 0.2, -7.8]} />
    <mesh position={[0, 0.2, -7.8]}><boxGeometry args={[7, 0.9, 0.3]} /><meshStandardMaterial color={colors.mint} /></mesh>
  </RigidBody>;
}
function Pin({ position, colors, index, refs }: { position: [number, number, number]; colors: Palette; index: number; refs: React.MutableRefObject<(RapierRigidBody | null)[]> }) {
  const geometry = useMemo(() => new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(0.18,0),new THREE.Vector2(0.24,0.3),new THREE.Vector2(0.16,0.55),new THREE.Vector2(0.07,0.8),new THREE.Vector2(0.1,1),new THREE.Vector2(0.13,1.07),new THREE.Vector2(0.08,1.17),new THREE.Vector2(0,1.2)],16), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <RigidBody ref={b => { refs.current[index] = b; }} position={position} colliders="hull" mass={0.35} restitution={0.2}><mesh geometry={geometry} castShadow><meshStandardMaterial color={colors.white} roughness={0.25} /></mesh><mesh position-y={0.84}><cylinderGeometry args={[0.082,0.082,0.1,16]} /><meshStandardMaterial color={colors.coral} /></mesh></RigidBody>;
}
function Course({ sport, round, colors, pins }: { sport: Sport; round: number; colors: Palette; pins: React.MutableRefObject<(RapierRigidBody | null)[]> }) {
  if (sport === "bowling") return <>{Array.from({ length: 10 }, (_, i) => { const row = i < 1 ? 0 : i < 3 ? 1 : i < 6 ? 2 : 3; const first = row * (row + 1) / 2; return <Pin key={i} index={i} refs={pins} colors={colors} position={[(i - first - row / 2) * 0.65, 0.03, -3.5 - row * 0.62]} />; })}</>;
  if (sport === "curling") return <>{([[2.6,"coral"],[1.8,"white"],[1,"mint"],[0.5,"yellow"]] as const).map(([r,c]) => <mesh key={r} rotation-x={-Math.PI/2} position={[0,0.012 + (2.7-r)*0.003,-4]}><circleGeometry args={[r,48]} /><meshStandardMaterial color={colors[c]} /></mesh>)}</>;
  if (sport === "basket") return <>
    <RigidBody type="fixed" colliders="cuboid"><mesh position={[0,3.2,-4.5]} castShadow><boxGeometry args={[2.6,1.8,0.16]} /><meshStandardMaterial color={colors.white} transparent opacity={0.7} /></mesh><mesh position={[0,1.6,-4.8]}><boxGeometry args={[0.15,3.2,0.15]} /><meshStandardMaterial color={colors.ink} /></mesh></RigidBody>
    <mesh rotation-x={Math.PI/2} position={[0,2.65,-3.9]}><torusGeometry args={[0.65,0.045,10,40]} /><meshStandardMaterial color={colors.yellow} metalness={0.45} roughness={0.25} /></mesh>
    {Array.from({length:12},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/6)*0.53,2.3,-3.9+Math.sin(i*Math.PI/6)*0.53]}><cylinderGeometry args={[0.015,0.015,0.65,4]} /><meshStandardMaterial color={colors.white} /></mesh>)}
  </>;
  return <>
    <mesh rotation-x={-Math.PI/2} position={[targetX(round),0.012,-4]}><circleGeometry args={[0.38,40]} /><meshStandardMaterial color={colors.ink} /></mesh>
    <mesh position={[targetX(round),1,-4]}><cylinderGeometry args={[0.02,0.02,2,8]} /><meshStandardMaterial color={colors.white} /></mesh>
    <mesh position={[targetX(round)+0.3,1.8,-4]}><boxGeometry args={[0.6,0.32,0.025]} /><meshStandardMaterial color={colors.coral} /></mesh>
    {round > 1 && [-1.9,1.9].map((x,i)=><RigidBody key={x} type="fixed"><mesh position={[x,0.2,round===2 ? -0.8 : 1-i*2]} castShadow><boxGeometry args={[2,0.4,0.55]} /><meshStandardMaterial color={colors.yellow} /></mesh></RigidBody>)}
  </>;
}

function Ball({ sport, round, shot, paused, colors, pins, onFinish }: { sport: Sport; round: number; shot: Shot; paused: boolean; colors: Palette; pins: React.MutableRefObject<(RapierRigidBody | null)[]>; onFinish: Props["onFinish"] }) {
  const body = useRef<RapierRigidBody>(null);
  const elapsed = useRef(0); const settled = useRef(0); const done = useRef(false); const launched = useRef(false); const basket = useRef(false); const lastY = useRef(1);
  const radius = sport === "bowling" ? 0.3 : sport === "basket" ? 0.25 : sport === "curling" ? 0.28 : 0.16;
  useBeforePhysicsStep(() => {
    if (paused || done.current || !body.current) return;
    const dt = 1/60; const rb = body.current;
    if (!launched.current) {
      launched.current = true;
      const a = shot.angle * Math.PI/180;
      const speed = sport === "basket" ? 3.75 + shot.power*0.04 : sport === "curling" ? 3 + shot.power*0.095 : sport === "golf" ? 2+shot.power*0.14 : 4 + shot.power*0.12;
      rb.setLinvel({x:Math.sin(a)*speed,y:sport === "basket" ? 6+shot.power*0.036 : 0,z:-Math.cos(a)*speed},true);
      rb.setAngvel({x:sport==="curling" ? 0 : -speed/radius,y:0,z:0},true);
    }
    elapsed.current += dt;
    const p = rb.translation(); const v = rb.linvel();
    if (sport === "basket" && lastY.current > 2.65 && p.y <= 2.65 && v.y < 0) { console.info("basket-cross",shot.power,p.x,p.z); if(Math.hypot(p.x,p.z+3.9)<0.55) basket.current = true; }
    lastY.current = p.y;
    const hole = sport === "golf" && Math.hypot(p.x-targetX(round),p.z+4)<0.38 && Math.hypot(v.x,v.z)<3.8;
    if (Math.hypot(v.x,v.y,v.z)<0.13) settled.current += dt; else settled.current = 0;
    if (hole || settled.current > 0.65 || elapsed.current > (sport === "curling" ? 12 : 8) || p.y < -3) {
      done.current = true;
      const points = sport === "basket" ? (basket.current ? 3 : 0) : sport === "curling" ? curlingScore(p.x,p.z) : sport === "bowling" ? pins.current.filter(pin => { if (!pin) return false; const q=pin.rotation(); return Math.abs(q.x)+Math.abs(q.z)>0.4 || pin.translation().y<0; }).length : 0;
      onFinish({points,hole,x:Math.max(-3.1,Math.min(3.1,p.x)),z:Math.max(-7,Math.min(6.5,p.z))});
    }
  });
  return <RigidBody ref={body} colliders={false} position={[shot.start[0],sport==="basket" ? 1 : radius+0.02,shot.start[1]]} mass={sport==="bowling" ? 3 : 1} friction={sport==="curling" ? 0.02 : 0.5} restitution={sport==="basket" ? 0.65 : 0.35} linearDamping={sport==="basket" ? 0 : sport==="curling" ? 0.38 : sport==="golf" ? 0.55 : 0.12} angularDamping={0.2} ccd>
    <BallCollider args={[radius]} />
    <mesh castShadow>{sport==="curling" ? <cylinderGeometry args={[radius,radius,0.16,24]} /> : <sphereGeometry args={[radius,24,16]} />}<meshStandardMaterial color={sport==="basket" ? colors.coral : shot.player===0 ? colors.white : colors.yellow} roughness={0.3} metalness={sport==="curling" ? 0.35 : 0.05} /></mesh>
    {sport==="curling" && <mesh position-y={0.17}><torusGeometry args={[0.12,0.04,8,16]} /><meshStandardMaterial color={shot.player===0 ? colors.coral : colors.mint} /></mesh>}
  </RigidBody>;
}

function World(props: Props & { colors: Palette }) {
  const pins = useRef<(RapierRigidBody|null)[]>([]);
  useEffect(() => { props.onReady(); }, [props.onReady]);
  useFrame(({camera,size}) => {
    const portrait = size.width/size.height<0.8;
    camera.position.set(0,portrait ? 21 : 13,portrait ? 25 : 18);
    camera.lookAt(0,0,-0.4);
  });
  return <>
    <Surface sport={props.sport} colors={props.colors} />
    <Course key={`${props.round}:${props.shot?.id??0}`} sport={props.sport} round={props.round} colors={props.colors} pins={pins} />
    {props.shot && <Ball key={props.shot.id} {...props} shot={props.shot} pins={pins} />}
    {!props.shot && <mesh position={[0,0.3,5]} castShadow><sphereGeometry args={[0.2,24,16]} /><meshStandardMaterial color={props.colors.white} /></mesh>}
    <Suspense fallback={null}>
      <Character url={props.avatar===0 ? boy.url : girl.url} position={[-4.2,0,3]} active={props.shot?.player===0} /><Character url={props.avatar===0 ? girl.url : boy.url} position={[4.2,0,0.5]} active={props.shot?.player===1} />
      {([-1,1] as const).map(side=><group key={side}><Scenery url={palm.url} position={[side*5.6,0,-5.5]} height={4} /><Scenery url={palm.url} position={[side*7,0,1]} height={3} /><Scenery url={rock.url} position={[side*5,-0.05,-7]} height={0.7} /><Scenery url={rock.url} position={[side*5.8,-0.05,5.3]} height={0.5} /></group>)}
    </Suspense>
  </>;
}
export default function SportsScene(props: Props) {
  const colors = useMemo(palette, []);
  return <Canvas shadows dpr={[1,1.5]} camera={{position:[0,11,13],fov:48}} gl={{antialias:true}}>
    <color attach="background" args={[colors.sky ?? ""]} />
    <ambientLight intensity={0.7} /><directionalLight position={[6,12,5]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    <Environment resolution={64}><Lightformer intensity={2} position={[0,8,0]} rotation-x={Math.PI/2} scale={[20,20,1]} /><Lightformer intensity={1} position={[-10,4,0]} rotation-y={Math.PI/2} scale={[10,10,1]} /></Environment>
    <mesh rotation-x={-Math.PI/2} position-y={-0.45} receiveShadow><planeGeometry args={[200,200]} /><meshStandardMaterial color={colors.sky} roughness={1} /></mesh>
    <Suspense fallback={null}><Physics paused={props.paused} gravity={[0,-9.81,0]} timeStep={1/60}><World {...props} colors={colors} /></Physics></Suspense>
  </Canvas>;
}