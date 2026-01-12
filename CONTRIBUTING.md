# Contributing to Protocol Omega

First off, thank you for deciding to contribute! It’s people like you that make the open source community such an amazing place to learn, inspire, and create.

## 🌟 The Vision
This project is an exploration of high-fidelity web performance, cinematic storytelling, and creative engineering. We aim to push the boundaries of what is possible in a browser.

## 🛠 Code Standards ("The Protocol")
To maintain the integrity of the system, all agents (contributors) must adhere to the following directives:

### 1. Clean Architecture
- **Components**: Keep components focused. Single responsibility principle applies.
- **Styling**: Use utility-first Tailwind classes. Avoid large custom CSS blocks unless necessary for specific animations.
- **State**: Use Svelte stores for global state.

### 2. High Performance
- **Frames Per Second**: All animations must target 60FPS. Heavy computations should be offloaded to Web Workers or initialized asynchronously.
- **Assets**: Optimize all 3D assets and textures. We value load times as much as visual fidelity.

### 3. Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: add new liquid physics to cursor`
- `fix: resolve z-index clipping on archive modal`
- `docs: update deployment protocol`

## 🚀 Pull Request Process

1.  **Fork** the repository to your own restricted sector.
2.  **Branch** off `main` with a descriptive feature name (`feat/cyber-lock-v2`).
3.  **Implement** your changes. Ensure the "Boot Sequence" remains intact.
4.  **Verify** locally using `npm run dev`.
5.  **Submit** a Pull Request.

## 🐛 Reporting Bugs
If you discover a glitch in the matrix, please open an Issue with:
- Browser & Version
- Steps to reproduce
- Expected vs Actual behavior

> *"We are building the future, one pixel at a time."*
