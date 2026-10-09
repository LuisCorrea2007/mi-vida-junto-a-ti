import type { UIMessage, ToolUIPart } from 'ai';
/** Only server-saved assistant content is trusted; clients may answer a pending approval, not rewrite it. */
export function reconcileAdvisorHistory(saved: UIMessage[], incoming: UIMessage[]): UIMessage[] {
  const history = saved.map(message => {
    if (message.role !== 'assistant') return message;
    const client = incoming.find(m => m.id === message.id);
    if (!client) return message;
    return { ...message, parts: message.parts.map(part => {
      if (!part.type.startsWith('tool-')) return part;
      const pending = part as ToolUIPart;
      if (pending.state !== 'approval-requested') return part;
      const answer = client.parts.find(p => p.type === pending.type && 'toolCallId' in p && p.toolCallId === pending.toolCallId) as ToolUIPart | undefined;
      if (answer?.state !== 'approval-responded' || answer.approval.id !== pending.approval.id) return part;
      if (JSON.stringify(answer.input) !== JSON.stringify(pending.input)) throw new Error('La acción cambió; vuelve a abrir la charla.');
      return { ...pending, state: 'approval-responded' as const, approval: { ...pending.approval, approved: answer.approval.approved } };
    }) };
  });
  const last = incoming[incoming.length - 1];
  if (last?.role === 'user' && !saved.some(m => m.id === last.id)) {
    if (!last.parts.length || last.parts.some(p => p.type !== 'text')) throw new Error('Envía un mensaje de texto para conversar.');
    if (last.parts.filter(p => p.type === 'text').map(p => p.text).join('').length > 12000) throw new Error('Divide tu mensaje en partes más cortas.');
    history.push(last);
  }
  return history;
}
