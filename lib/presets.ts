/**
 * Curated force-matrix presets. Each one produces a visually distinct family
 * of emergent behaviour. Matrices are square (species x species), values [-1,1].
 */

export interface Preset {
  id: string
  name: string
  description: string
  species: number
  rMax: number
  forceFactor: number
  friction: number
  beta: number
  matrix: number[][]
}

export const PRESETS: Preset[] = [
  {
    id: 'genesis',
    name: 'Genesis',
    description: 'Balanced cells that bloom, divide and drift like early life.',
    species: 5,
    rMax: 0.12,
    forceFactor: 2.0,
    friction: 0.04,
    beta: 0.3,
    matrix: [
      [0.6, -0.2, 0.0, 0.3, -0.4],
      [-0.3, 0.6, -0.2, 0.0, 0.3],
      [0.2, -0.3, 0.6, -0.2, 0.0],
      [0.0, 0.2, -0.3, 0.6, -0.2],
      [-0.2, 0.0, 0.2, -0.3, 0.6],
    ],
  },
  {
    id: 'predator',
    name: 'Predator / Prey',
    description: 'One species hunts, another flees — endless chase spirals.',
    species: 4,
    rMax: 0.14,
    forceFactor: 2.4,
    friction: 0.05,
    beta: 0.28,
    matrix: [
      [-0.3, 1.0, 0.0, 0.0],
      [-1.0, -0.3, 0.6, 0.0],
      [0.4, -0.8, -0.3, 0.5],
      [0.0, 0.3, -0.6, -0.3],
    ],
  },
  {
    id: 'membranes',
    name: 'Membranes',
    description: 'Self-assembling walls and cellular boundaries.',
    species: 3,
    rMax: 0.16,
    forceFactor: 1.8,
    friction: 0.06,
    beta: 0.35,
    matrix: [
      [0.9, -0.6, -0.6],
      [-0.6, 0.9, -0.6],
      [-0.6, -0.6, 0.9],
    ],
  },
  {
    id: 'vortex',
    name: 'Vortex',
    description: 'Asymmetric rules spin the swarm into rotating galaxies.',
    species: 4,
    rMax: 0.13,
    forceFactor: 2.6,
    friction: 0.035,
    beta: 0.25,
    matrix: [
      [0.2, 0.7, -0.5, 0.0],
      [-0.5, 0.2, 0.7, 0.0],
      [0.7, -0.5, 0.2, 0.0],
      [0.0, 0.0, 0.3, 0.4],
    ],
  },
  {
    id: 'symbiosis',
    name: 'Symbiosis',
    description: 'Species cling together into warm, breathing colonies.',
    species: 5,
    rMax: 0.11,
    forceFactor: 1.6,
    friction: 0.05,
    beta: 0.32,
    matrix: [
      [0.5, 0.4, 0.0, 0.0, 0.3],
      [0.4, 0.5, 0.4, 0.0, 0.0],
      [0.0, 0.4, 0.5, 0.4, 0.0],
      [0.0, 0.0, 0.4, 0.5, 0.4],
      [0.3, 0.0, 0.0, 0.4, 0.5],
    ],
  },
  {
    id: 'snow',
    name: 'Snowflakes',
    description: 'Crystalline lattices freeze out of the noise.',
    species: 6,
    rMax: 0.1,
    forceFactor: 1.4,
    friction: 0.08,
    beta: 0.4,
    matrix: [
      [0.8, -0.4, -0.4, -0.4, -0.4, -0.4],
      [-0.4, 0.8, -0.4, -0.4, -0.4, -0.4],
      [-0.4, -0.4, 0.8, -0.4, -0.4, -0.4],
      [-0.4, -0.4, -0.4, 0.8, -0.4, -0.4],
      [-0.4, -0.4, -0.4, -0.4, 0.8, -0.4],
      [-0.4, -0.4, -0.4, -0.4, -0.4, 0.8],
    ],
  },
]

export const DEFAULT_PRESET = PRESETS[0]
