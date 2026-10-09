import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route=createFileRoute("/_authenticated/juegos")({beforeLoad:()=>{throw redirect({to:"/panel"});}});
