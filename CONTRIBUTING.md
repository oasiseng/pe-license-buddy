# Contributing to PE License Buddy

## Getting started
1. Copy `.env.example` to `.env` and update configuration values.
2. Run `npm install` (no external dependencies are required for the current MVP).
3. Use `npm start` to launch the API locally.

## Development workflow
- Add tests under `tests/` using Node's built-in `node:test` module.
- Run `npm test` before opening a pull request.
- Update documentation in `docs/` when adding new endpoints or workflows.

## Commit guidelines
- Keep commits focused on a single change.
- Reference issues in commit messages where applicable.
- Ensure `npm test` passes and `npm run lint` (if introduced) succeeds.

## Code style
- Use modern JavaScript (ES2020+) with CommonJS modules.
- Prefer small, composable functions over large scripts.
- Avoid introducing runtime dependencies unless necessary; the project favors the Node standard library.

## Communication
Open an issue for feature requests or bugs with clear reproduction steps and expected behavior. Pull requests should include a summary of changes and testing performed.
