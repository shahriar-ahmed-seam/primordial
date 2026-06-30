'use client'

import { Pause, Play, Sparkles, Shuffle, SlidersHorizontal, Activity } from 'lucide-react'

interface TopBarProps {
  fps: number
  count: number
  presetName: string
  running: boolean
  panelOpen: boolean
  onToggleRun: () => void
  onBigBang: () => void
  onRandomize: () => void
  onTogglePanel: () => void
}

export default function TopBar({
  fps,
  count,
  presetName,
  running,
  panelOpen,
  onToggleRun,
  onBigBang,
  onRandomize,
  onTogglePanel,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden>
          <Sparkles size={18} />
        </span>
        <div className="brand-text">
          <strong>PRIMORDIAL</strong>
          <span>Artificial Life Engine</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="stat" title="Frames per second">
          <Activity size={14} />
          <span className={fps >= 50 ? 'ok' : fps >= 30 ? 'warn' : 'bad'}>{fps}</span>
          <small>fps</small>
        </div>
        <div className="stat" title="Active particles">
          <span>{count.toLocaleString()}</span>
          <small>cells</small>
        </div>
        <div className="stat preset" title="Active preset">
          {presetName}
        </div>

        <button className="btn" onClick={onToggleRun} aria-pressed={running}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          <span>{running ? 'Pause' : 'Play'}</span>
        </button>
        <button className="btn" onClick={onBigBang}>
          <Sparkles size={16} />
          <span>Big Bang</span>
        </button>
        <button className="btn" onClick={onRandomize}>
          <Shuffle size={16} />
          <span>Randomize</span>
        </button>
        <button
          className={`btn ${panelOpen ? 'active' : ''}`}
          onClick={onTogglePanel}
          aria-pressed={panelOpen}
        >
          <SlidersHorizontal size={16} />
          <span>Controls</span>
        </button>
      </div>
    </header>
  )
}
