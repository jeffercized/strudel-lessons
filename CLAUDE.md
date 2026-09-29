# Strudel Lessons
Strudel learning site. Astro static site; lessons are markdown in src/content/lessons/.
- Lesson TEXT is authored outside this repo. Never rewrite teaching content; only fix code that won't run, and report it.
- ```strudel blocks = playable editors (@strudel/repl, pinned version). ```grid blocks = static cycle diagrams using Strudel's parser.
- Never use slider(): it doesn't work in every browser.
- No backend. State in localStorage only.
- Explain every change in plain language in PR descriptions.
- Plans (docs/plans/), prototypes (docs/prototypes/) and spike notes (spike/) are local only and git-ignored.
- @strudel/mini is pinned to 1.2.5 because 1.2.6 crashes on import in Node.
- Checks: npm run lint && npm run typecheck && npm test && npm run build
- Astro 7: remark plugins need @astrojs/markdown-remark; build uses --force (content cache goes stale); `astro dev`/`preview` run detached (stop with `npx astro dev stop`). The dev server can keep serving stale lesson HTML after a remark-plugin change, even with --force; test those on `npm run build` + a static server.
- Strudel: a missing sample (e.g. `perc` with no bank) does NOT set evalError; check `soundMap.get()` in the browser. Cmd+Enter is handled by our code, not Strudel.
- `<strudel-editor>` puts its visible code box *next to* itself, not inside. To hide one, wrap it in an off-screen box (see src/scripts/practice/sound.ts).
- ```check id="…" blocks in a lesson use ids from `checks` in src/content/practice/<lesson>.practice.json. A missing id fails the build (red box in dev).
- Section progress is keyed by `##` heading slugs. Renaming a heading resets its completion; that is accepted. "Cheat cards" is never a section.
