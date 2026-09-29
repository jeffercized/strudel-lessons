# Strudel Lessons

Learn [Strudel](https://strudel.cc), the browser-based live-coding music language, one concept at a time.

Live site: https://strudel.frequency.fyi

Each lesson is a markdown file with:
- **Playable code blocks.** Edit the code, press Play, and hear the change.
- **Cycle grids.** Diagrams of when each sound plays, which you can also play.
- **Checks.** Short drills after each section: read, type, predict, build, ear and fix.
- **Section progress,** saved in your own browser only.

There are no accounts and no server. The site is static.

## Run it

Needs Node 24.

```sh
npm install
npm run dev        # http://localhost:4321
```

Checks (the same ones CI runs on every pull request):

```sh
npm run lint && npm run typecheck && npm test && npm run build
npx playwright test   # browser tests, under the same security headers as the live site
```

## Where things are

- `src/content/lessons/`: the lessons (markdown)
- `src/content/practice/`: check and review items for each lesson (JSON)
- `src/lib/`: rhythm, grid and progress logic, with unit tests
- `src/scripts/`: the code that runs in the browser
- `vercel.json`: security headers

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).

This site uses [Strudel](https://strudel.cc) (`@strudel/repl` and `@strudel/mini`), which is licensed under AGPL-3.0-or-later.
