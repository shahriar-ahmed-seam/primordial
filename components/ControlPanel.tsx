'use client'

import { X } from 'lucide-react'
import { PALETTE } from '@/lib/engine'
import type { FieldControls } from '@/lib/useParticleField'
import type { Preset } from '@/lib/presets'

interface ControlPanelProps {
  open: boolean
  preset: Preset
  presets: Preset[]
  count: number
  controls: FieldControls
  onPreset: (p: Preset) => void
  onCount: (n: number) => void
  onControls: (c: FieldControls) => void
  onMatrix: (i: number, j: number, value: number) => void
  onClose: () => void
}

function rgb([r, g, b]: [number, number, number], a = 1) {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
}

function cellColor(v: number) {
  // green for attraction, red for repulsion, transparent near zero.
  const a = Math.min(Math.abs(v), 1)
  return v >= 0
    ? `rgba(64, 220, 150, ${0.12 + a * 0.6})`
    : `rgba(240, 80, 110, ${0.12 + a * 0.6})`
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <label className="slider">
      <div className="slider-head">
        <span>{label}</span>
        <span className="slider-val">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}

export default function ControlPanel({
  open,
  preset,
  presets,
  count,
  controls,
  onPreset,
  onCount,
  onControls,
  onMatrix,
  onClose,
}: ControlPanelProps) {
  const species = preset.species
  const matrix = preset.matrix

  return (
    <aside className={`panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="panel-head">
        <div>
          <h2>Composer</h2>
          <p>Shape the rules of an artificial universe</p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      </div>

      <section className="panel-section">
        <h3>Presets</h3>
        <div className="preset-grid">
          {presets.map((p) => (
            <button
              key={p.id}
              className={`preset-card ${preset.id === p.id ? 'selected' : ''}`}
              onClick={() => onPreset(p)}
              title={p.description}
            >
              <span className="preset-dots" aria-hidden>
                {Array.from({ length: p.species }).map((_, i) => (
                  <i key={i} style={{ background: rgb(PALETTE[i % PALETTE.length]) }} />
                ))}
              </span>
              <strong>{p.name}</strong>
              <small>{p.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Field</h3>
        <Slider
          label="Particles"
          value={count}
          min={500}
          max={8000}
          step={500}
          format={(v) => v.toLocaleString()}
          onChange={onCount}
        />
        <Slider
          label="Trail persistence"
          value={controls.trails}
          min={0}
          max={0.97}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => onControls({ ...controls, trails: v })}
        />
        <Slider
          label="Glow"
          value={controls.glow}
          min={0.4}
          max={1.8}
          step={0.05}
          format={(v) => `${v.toFixed(2)}x`}
          onChange={(v) => onControls({ ...controls, glow: v })}
        />
        <Slider
          label="Pointer force"
          value={controls.pointerStrength}
          min={0}
          max={16}
          step={1}
          onChange={(v) => onControls({ ...controls, pointerStrength: v })}
        />
      </section>

      <section className="panel-section">
        <h3>Force matrix</h3>
        <p className="hint">
          Rows act on columns. <span className="pos">Green</span> attracts,{' '}
          <span className="neg">red</span> repels.
        </p>
        <div
          className="matrix"
          style={{ gridTemplateColumns: `auto repeat(${species}, 1fr)` }}
        >
          <span />
          {Array.from({ length: species }).map((_, j) => (
            <span key={`h${j}`} className="matrix-dot">
              <i style={{ background: rgb(PALETTE[j % PALETTE.length]) }} />
            </span>
          ))}
          {Array.from({ length: species }).map((_, i) => (
            <Row
              key={`r${i}`}
              i={i}
              species={species}
              matrix={matrix}
              onMatrix={onMatrix}
            />
          ))}
        </div>
      </section>
    </aside>
  )
}

function Row({
  i,
  species,
  matrix,
  onMatrix,
}: {
  i: number
  species: number
  matrix: number[][]
  onMatrix: (i: number, j: number, value: number) => void
}) {
  return (
    <>
      <span className="matrix-dot">
        <i style={{ background: rgb(PALETTE[i % PALETTE.length]) }} />
      </span>
      {Array.from({ length: species }).map((_, j) => {
        const v = matrix[i]?.[j] ?? 0
        return (
          <button
            key={`${i}-${j}`}
            className="matrix-cell"
            style={{ background: cellColor(v) }}
            title={`${v.toFixed(2)} — drag to adjust`}
            onWheel={(e) => {
              e.preventDefault()
              const next = Math.max(-1, Math.min(1, v - Math.sign(e.deltaY) * 0.1))
              onMatrix(i, j, Math.round(next * 100) / 100)
            }}
            onClick={() => {
              const next = Math.max(-1, Math.min(1, v + 0.2 > 1 ? -1 : v + 0.2))
              onMatrix(i, j, Math.round(next * 100) / 100)
            }}
          >
            {v.toFixed(1)}
          </button>
        )
      })}
    </>
  )
}
