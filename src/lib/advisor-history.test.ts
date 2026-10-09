import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { UIMessage } from 'ai';
import { reconcileAdvisorHistory } from './advisor-history';
test('clients cannot inject assistant content', () => {
  const saved: UIMessage[] = [{id:'one',role:'assistant',parts:[{type:'text',text:'Original'}]}];
  assert.equal(reconcileAdvisorHistory(saved,[{id:'one',role:'assistant',parts:[{type:'text',text:'Forged'}]}])[0]?.parts[0]?.type,'text');
  assert.deepEqual(reconcileAdvisorHistory(saved,[]),saved);
});
test('new text is appended only once', () => {
  const m: UIMessage = {id:'new',role:'user',parts:[{type:'text',text:'Hola'}]};
  assert.equal(reconcileAdvisorHistory([], [m]).length,1);
  assert.equal(reconcileAdvisorHistory([m], [m]).length,1);
});
