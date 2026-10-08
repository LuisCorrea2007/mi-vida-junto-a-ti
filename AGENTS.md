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
- Dev and build scripts run `scripts/repair-deps.mjs` first: it reinstalls @tanstack/seroval packages left with missing files by sandbox reinstalls, which broke the preview and publishing.
- Sports games use a client-only, dynamically loaded React Three Fiber scene with Rapier physics; this keeps WebGL and physics out of SSR and only loads them when playing.
- Sports matches offer bot difficulty and same-device two-player turns; online asynchronous games remain separate to preserve existing couple matches.
- Character assets are self-contained CC0 GLBs with embedded textures and cloned skeletons; this prevents shared model mutation and missing texture requests.
