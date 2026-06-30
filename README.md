<div align="center">

# 🌌 Primordial

### An interactive **Particle Life** engine — emergent artificial life from a force matrix.

Thousands of particles. A handful of rules. Watch cells, membranes and galaxies assemble themselves in real time.

[**▶ Live Demo**](https://swarm-lemon.vercel.app) · [Report a bug](https://github.com/shahriar-ahmed-seam/primordial/issues) · [Request a feature](https://github.com/shahriar-ahmed-seam/primordial/issues)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white) ![License](https://img.shields.io/badge/license-MIT-green) ![Bundle](https://img.shields.io/badge/First%20Load-88.5kB-brightgreen)

</div>

---

## What is this?

**Particle Life** is a model of artificial life. Every particle belongs to a *species*, and each species is attracted to or repelled by every other species according to a **force matrix**. There is no global goal and nothing is choreographed — yet from these purely local interactions, complex macro-structures *emerge*: dividing cells, self-healing membranes, predator–prey chases, rotating galaxies.

Primordial turns that idea into a polished, cinematic, fully interactive playground in the browser.

## Features

- **Real-time emergent simulation** — up to 8,000 particles with a true Particle-Life force model (not random sampling).
- **O(n) spatial-hash physics** — a uniform grid with toroidal wrapping keeps thousands of particles smooth on the CPU; no fragile GPU float-textures required, so it runs reliably on any device.
- **Live force-matrix editor** — click or scroll any cell to tune how each species reacts to the others. Green attracts, red repels.
- **Six curated presets** — Genesis, Predator/Prey, Membranes, Vortex, Symbiosis and Snowflakes, each a distinct emergent world.
- **Cinematic rendering** — additive neon glow with adjustable motion trails and a film-grade vignette.
- **Pointer interaction** — hold and drag to stir the field; **Big Bang** sends a radial shockwave through the cosmos.
- **Bespoke glassmorphic UI** — a custom control room (no off-the-shelf debug GUI) with presets, sliders and a live FPS readout.
- **Keyboard shortcuts** — `Space` Big Bang · `P` play/pause · `R` randomize · `C` toggle controls.
- **Featherweight** — 88.5 kB First Load JS, fully static, zero backend.

## Controls

| Action | Input |
| --- | --- |
| Stir the field | Hold / drag the pointer |
| Big Bang shockwave | `Space` or the toolbar button |
| Play / pause | `P` |
| Randomize the matrix | `R` |
| Toggle the control panel | `C` |
| Tune a species rule | Click (or scroll) a matrix cell |

## Tech stack

- **Next.js 14** (App Router) + **React 18**
- **TypeScript** for the engine and UI
- **HTML5 Canvas 2D** with additive compositing for rendering
- **lucide-react** icons
- Zero runtime dependencies beyond React — the simulation engine is hand-written and framework-agnostic.

## How it works

```
            ┌──────────────────────────────────────────┐
            │              ParticleLife engine          │
            │  • typed-array particle state (x,y,v,type) │
            │  • uniform spatial-hash grid (O(n))        │
            │  • force matrix → attraction / repulsion   │
            └────────────────────┬─────────────────────┘
                                 │ step(dt)
            ┌────────────────────▼─────────────────────┐
            │           useParticleField (rAF)          │
            │  • cached glow sprites per species         │
            │  • additive "lighter" compositing + trails │
            └────────────────────┬─────────────────────┘
                                 │ paints
                          ┌──────▼──────┐
                          │  <canvas>   │
                          └─────────────┘
```

The force curve follows the classic Ventrella / Tom Mohr formulation: a hard repulsion below `beta·rMax` to prevent overlap, and a triangular attraction band up to `rMax` whose sign and strength come from the species matrix.

## Getting started

```bash
git clone https://github.com/shahriar-ahmed-seam/primordial.git
cd primordial
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run build   # production build
npm start       # serve the build
```

## Deploy

This is a static Next.js app — deploy it to **Vercel** in one click, or any static-friendly host.

```bash
vercel --prod
```

## Project structure

```
primordial/
├── app/
│   ├── layout.tsx          # metadata, fonts, theming
│   ├── page.tsx            # client entry → Experience
│   └── globals.css         # cinematic design system
├── components/
│   ├── Experience.tsx      # state + orchestration
│   ├── TopBar.tsx          # brand + transport controls + stats
│   ├── ControlPanel.tsx    # presets, sliders, force-matrix editor
│   └── IntroOverlay.tsx    # title sequence
└── lib/
    ├── engine.ts           # Particle Life simulation (spatial grid)
    ├── presets.ts          # curated force matrices
    └── useParticleField.ts # render loop + interaction
```

## License

MIT © [Shahriar Ahmed](https://github.com/shahriar-ahmed-seam)

<div align="center">
<sub>Built with curiosity about how complexity emerges from simplicity.</sub>
</div>
