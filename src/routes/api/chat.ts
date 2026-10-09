import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/chat")({server:{handlers:{POST:async({request})=>{const {handleAdvisor}=await import('@/lib/advisor.server');return handleAdvisor(request);}}}});
