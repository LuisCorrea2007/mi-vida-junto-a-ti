<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Decisions
- Love dice uses a browser-safe combinatorial catalog and session-only play state: counted options represent complete action/place/duration combinations, not thousands of individually authored prompts.
- Dev and build scripts run `scripts/repair-deps.mjs` first: it reinstalls @tanstack/seroval packages left with missing files by sandbox reinstalls, which broke the preview and publishing.

- Shared location tracking lives in the authenticated shell and only follows a previously consented sharing session; navigation must not stop updates or extend consent.
- Retired published sections keep a redirect without loading removed feature code, preserving old links.
- Realtime refreshes are debounced and recover on reconnect or visibility changes to avoid stale couple data.
- Love letters stay owner-editable; the recipient marks them opened only through a security-definer function.
- Games share browser-safe board rules with local search bots; lazy-loaded Three.js views and fixed-step Matter.js sports keep rendering separate from decisions and avoid billed AI calls per move.
- Online turn-based games reuse couple_games; optimistic updates compare turn and updated_at, while removed game types stay hidden without deleting private history.
