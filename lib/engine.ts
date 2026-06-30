/**
 * Particle Life engine.
 *
 * A deterministic, GPU-friendly implementation of the classic "Particle Life"
 * model (Ventrella / Tom Mohr). Every particle belongs to a species and is
 * attracted to / repelled by every other species according to a force matrix.
 * Simple local rules produce emergent macro structures: cells, chains,
 * membranes, pulsating organisms.
 *
 * Neighbour lookups use a uniform spatial hash grid so the simulation runs in
 * roughly O(n) instead of O(n^2). This keeps thousands of particles smooth on
 * the CPU and avoids the cross-device fragility of float-texture GPGPU.
 */

export interface EngineOptions {
  count: number
  species: number
  /** Maximum interaction distance, in normalized [0,1] space. */
  rMax: number
  /** Global force strength multiplier. */
  forceFactor: number
  /** Velocity half-life (seconds). Lower = more viscous. */
  friction: number
  /** Repulsion radius as a fraction of rMax (0..1). */
  beta: number
  /** Species attraction matrix, sized species x species, values in [-1, 1]. */
  matrix: number[][]
}

export const DEFAULT_OPTIONS: EngineOptions = {
  count: 3500,
  species: 5,
  rMax: 0.12,
  forceFactor: 2.0,
  friction: 0.04,
  beta: 0.3,
  matrix: [],
}

/** Cinematic neon palette (RGB 0..1) shared by the engine and the renderer. */
export const PALETTE: [number, number, number][] = [
  [1.0, 0.23, 0.42], // rose
  [0.18, 0.92, 0.85], // aqua
  [0.55, 0.95, 0.32], // lime
  [0.72, 0.42, 1.0], // violet
  [1.0, 0.78, 0.25], // amber
  [0.32, 0.62, 1.0], // azure
]

export function randomMatrix(species: number): number[][] {
  const m: number[][] = []
  for (let i = 0; i < species; i++) {
    m[i] = []
    for (let j = 0; j < species; j++) {
      m[i][j] = Math.round((Math.random() * 2 - 1) * 100) / 100
    }
  }
  return m
}

export class ParticleLife {
  opts: EngineOptions
  count: number
  // Flat typed arrays for cache-friendly access.
  px: Float32Array
  py: Float32Array
  vx: Float32Array
  vy: Float32Array
  type: Uint8Array

  // Spatial grid.
  private cols = 0
  private rows = 0
  private cellSize = 0
  private cellStart: Int32Array = new Int32Array(0)
  private cellCount: Int32Array = new Int32Array(0)
  private order: Int32Array = new Int32Array(0)

  constructor(opts: EngineOptions) {
    this.opts = { ...opts }
    this.count = opts.count
    this.px = new Float32Array(this.count)
    this.py = new Float32Array(this.count)
    this.vx = new Float32Array(this.count)
    this.vy = new Float32Array(this.count)
    this.type = new Uint8Array(this.count)
    this.reset()
  }

  /** Re-seed all particles with random positions and species. */
  reset() {
    const { count } = this
    const species = this.opts.species
    for (let i = 0; i < count; i++) {
      this.px[i] = Math.random()
      this.py[i] = Math.random()
      this.vx[i] = 0
      this.vy[i] = 0
      this.type[i] = Math.floor(Math.random() * species)
    }
    this.buildGrid()
  }

  setMatrix(matrix: number[][]) {
    this.opts.matrix = matrix
  }

  private buildGrid() {
    this.cellSize = Math.max(this.opts.rMax, 1e-4)
    this.cols = Math.max(1, Math.floor(1 / this.cellSize))
    this.rows = this.cols
    const cells = this.cols * this.rows
    this.cellStart = new Int32Array(cells)
    this.cellCount = new Int32Array(cells)
    this.order = new Int32Array(this.count)
  }

  private cellIndex(x: number, y: number): number {
    let cx = Math.floor(x * this.cols)
    let cy = Math.floor(y * this.rows)
    if (cx < 0) cx = 0
    else if (cx >= this.cols) cx = this.cols - 1
    if (cy < 0) cy = 0
    else if (cy >= this.rows) cy = this.rows - 1
    return cy * this.cols + cx
  }

  /** Counting-sort particles into grid cells for fast neighbour queries. */
  private rebin() {
    const cells = this.cols * this.rows
    this.cellCount.fill(0)
    for (let i = 0; i < this.count; i++) {
      this.cellCount[this.cellIndex(this.px[i], this.py[i])]++
    }
    let acc = 0
    for (let c = 0; c < cells; c++) {
      this.cellStart[c] = acc
      acc += this.cellCount[c]
    }
    const cursor = this.cellStart.slice()
    for (let i = 0; i < this.count; i++) {
      const c = this.cellIndex(this.px[i], this.py[i])
      this.order[cursor[c]++] = i
    }
  }

  /**
   * Particle Life force curve.
   * - r < beta            : hard repulsion (avoids overlap)
   * - beta < r < 1        : species attraction shaped as a triangle
   * - r > 1               : no interaction
   * r here is normalized by rMax.
   */
  private static force(r: number, a: number, beta: number): number {
    if (r < beta) return r / beta - 1
    if (r < 1) return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta))
    return 0
  }

  /**
   * Advance the simulation by dt seconds.
   * mouse: optional repulsion centre in normalized space (or null).
   */
  step(dt: number, mouse: { x: number; y: number; strength: number } | null) {
    const {
      rMax,
      forceFactor,
      friction,
      beta,
      matrix,
      species,
    } = this.opts
    if (matrix.length < species) return

    this.rebin()

    const cols = this.cols
    const rows = this.rows
    const frictionFactor = Math.pow(0.5, dt / Math.max(friction, 1e-3))
    const rMaxSq = rMax * rMax

    for (let i = 0; i < this.count; i++) {
      const xi = this.px[i]
      const yi = this.py[i]
      const ti = this.type[i]
      let fx = 0
      let fy = 0

      const cx = Math.min(cols - 1, Math.max(0, Math.floor(xi * cols)))
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(yi * rows)))

      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          // Toroidal wrap so structures flow seamlessly across edges.
          let ncx = cx + ox
          let ncy = cy + oy
          let shiftX = 0
          let shiftY = 0
          if (ncx < 0) {
            ncx += cols
            shiftX = -1
          } else if (ncx >= cols) {
            ncx -= cols
            shiftX = 1
          }
          if (ncy < 0) {
            ncy += rows
            shiftY = -1
          } else if (ncy >= rows) {
            ncy -= rows
            shiftY = 1
          }
          const cell = ncy * cols + ncx
          const start = this.cellStart[cell]
          const end = start + this.cellCount[cell]
          for (let k = start; k < end; k++) {
            const j = this.order[k]
            if (j === i) continue
            const dx = this.px[j] + shiftX - xi
            const dy = this.py[j] + shiftY - yi
            const d2 = dx * dx + dy * dy
            if (d2 > rMaxSq || d2 === 0) continue
            const d = Math.sqrt(d2)
            const f = ParticleLife.force(d / rMax, matrix[ti][this.type[j]], beta)
            fx += (dx / d) * f
            fy += (dy / d) * f
          }
        }
      }

      fx *= rMax * forceFactor
      fy *= rMax * forceFactor

      // Pointer repulsion.
      if (mouse) {
        const dx = xi - mouse.x
        const dy = yi - mouse.y
        const d2 = dx * dx + dy * dy
        const radius = 0.14
        if (d2 < radius * radius && d2 > 1e-6) {
          const d = Math.sqrt(d2)
          const push = (1 - d / radius) * mouse.strength
          fx += (dx / d) * push
          fy += (dy / d) * push
        }
      }

      this.vx[i] = this.vx[i] * frictionFactor + fx * dt
      this.vy[i] = this.vy[i] * frictionFactor + fy * dt
    }

    // Integrate + wrap.
    for (let i = 0; i < this.count; i++) {
      let nx = this.px[i] + this.vx[i] * dt
      let ny = this.py[i] + this.vy[i] * dt
      nx -= Math.floor(nx)
      ny -= Math.floor(ny)
      this.px[i] = nx
      this.py[i] = ny
    }
  }

  /** Radial impulse from a centre point ("Big Bang"). */
  impulse(cx: number, cy: number, strength: number) {
    for (let i = 0; i < this.count; i++) {
      const dx = this.px[i] - cx
      const dy = this.py[i] - cy
      const d = Math.sqrt(dx * dx + dy * dy) || 1e-3
      this.vx[i] += (dx / d) * strength
      this.vy[i] += (dy / d) * strength
    }
  }

  /** Resize particle count, preserving as much state as possible. */
  resize(count: number) {
    if (count === this.count) return
    const old = {
      px: this.px,
      py: this.py,
      vx: this.vx,
      vy: this.vy,
      type: this.type,
      n: this.count,
    }
    this.count = count
    this.px = new Float32Array(count)
    this.py = new Float32Array(count)
    this.vx = new Float32Array(count)
    this.vy = new Float32Array(count)
    this.type = new Uint8Array(count)
    for (let i = 0; i < count; i++) {
      if (i < old.n) {
        this.px[i] = old.px[i]
        this.py[i] = old.py[i]
        this.vx[i] = old.vx[i]
        this.vy[i] = old.vy[i]
        this.type[i] = old.type[i]
      } else {
        this.px[i] = Math.random()
        this.py[i] = Math.random()
        this.type[i] = Math.floor(Math.random() * this.opts.species)
      }
    }
    this.opts.count = count
    this.buildGrid()
  }

  setSpecies(species: number) {
    this.opts.species = species
    for (let i = 0; i < this.count; i++) {
      if (this.type[i] >= species) this.type[i] = Math.floor(Math.random() * species)
    }
  }

  setRMax(rMax: number) {
    this.opts.rMax = rMax
    this.buildGrid()
  }
}
