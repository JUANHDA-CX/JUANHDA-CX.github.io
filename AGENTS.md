# AGENTS.md — JUANHDA-CX.github.io

Project instructions for AI agents working in this repository. Read this file before making changes.

## Browser Verification (MANDATORY)

Any change that affects what the browser renders or how it behaves — HTML, CSS, JavaScript, UI copy, animations, layout, or interactions — MUST be verified in `ego-browser` before reporting it complete. Reading the code or running static checks is not enough: load the `ego-browser` skill, open the page in a real browser, exercise the changed behavior (load, click, hover, scroll, resize, reload), and confirm the observed result against what was requested. Serve the site over local HTTP (`http://127.0.0.1:<port>`), not `file://`, so the page behaves like production.

At the start of every session, check whether the site's local server is already running at `http://127.0.0.1:5500/`. If it is not, start a static server from the repository root on port 5500 before doing any browser verification.

## Code Organization (MANDATORY)

- Styles always go in the project's CSS file when possible. Never inject CSS from JavaScript or add `<style>` blocks to HTML unless there is no viable stylesheet target.
- JavaScript behavior always goes in `main.js` when possible. Animations go in `anim.js`. Do not create ad-hoc script files or inline scripts unless neither file is a viable home.
- Respect the existing file structure:
  - Root: one `.html` page per route (`index.html`, `gallery.html`, `services.html`, `contact.html`, etc.).
  - Styles: shared site styles in `styles.css`; page-specific styles in the matching file (`gallery.html` → `gallery.css`, `index.html` → `index.css`, `services.html` → `services.css`, `contact.html` → `contact.css`).
  - Behavior: shared behavior in `main.js`, scroll and reveal animations in `anim.js`.
  - Content data: `gallery-database.json`.
- Reuse existing helpers, classes, and components before creating new ones. Do not rename, move, or delete files, or restructure folders, unless the task explicitly requires it.

## Code Style

- Match the style of the file you are editing. Inspect nearby code before writing.
- Indentation: 2 spaces in HTML, CSS, and `main.js`; 4 spaces in `anim.js` and `menuMobile.js`.
- JavaScript: semicolons, the file's existing quote style (`main.js` uses double quotes, `menuMobile.js` uses single quotes), and `const`/`let` over `var` in new code.
- CSS: one property per line, 2-space indentation, lowercase hyphenated class names, selectors scoped to the page or component they style.
- Keep changes minimal and local to the requested behavior. Do not reformat unrelated code.
- Do not add build tooling, frameworks, or dependencies for work that plain HTML, CSS, and JavaScript can handle.

## Data Conventions

- `gallery-database.json` drives the gallery. Keep every `category.tags` value lowercase and comma-separated.
