'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParticleField, type FieldControls } from '@/lib/useParticleField'
import { DEFAULT_OPTIONS, randomMatrix, type EngineOptions } from '@/lib/engine'
import { PRESETS, DEFAULT_PRESET, type Preset } from '@/lib/presets'
import ControlPanel from './ControlPanel'
import IntroOverlay from './IntroOverlay'
import TopBar from './TopBar'

function optionsFromPreset(preset: Preset, count: number): EngineOptions {
  return {
    ...DEFAULT_OPTIONS,
    count,
    species: preset.species,
    rMax: preset.rMax,
    forceFactor: preset.forceFactor,
    friction: preset.friction,
    beta: preset.beta,
    matrix: preset.matrix.map((row) => [...row]),
  }
}

export default function Experience() {
  const [preset, setPreset] = useState<Preset>(DEFAULT_PRESET)
  const [count, setCount] = useState(3500)
  const [fps, setFps] = useState(60)
  const [panelOpen, setPanelOpen] = useState(true)

  const [controls, setControls] = useState<FieldControls>({
    running: true,
    trails: 0.82,
    glow: 0.9,
    pointerStrength: 6,
  })

  const options = useMemo(
    () => optionsFromPreset(DEFAULT_PRESET, 3500),
    []
  )

  const { canvasRef, engineRef } = useParticleField({
    options,
    controls,
    onFps: setFps,
  })

  const applyPreset = useCallback(
    (next: Preset) => {
      setPreset(next)
      const engine = engineRef.current
      if (!engine) return
      engine.opts.species = next.species
      engine.opts.forceFactor = next.forceFactor
      engine.opts.friction = next.friction
      engine.opts.beta = next.beta
      engine.setRMax(next.rMax)
      engine.setMatrix(next.matrix.map((r) => [...r]))
      engine.setSpecies(next.species)
      engine.reset()
    },
    [engineRef]
  )

  const randomize = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    const m = randomMatrix(engine.opts.species)
    engine.setMatrix(m)
    setPreset((p) => ({ ...p, name: 'Custom', id: 'custom', matrix: m }))
    engine.reset()
  }, [engineRef])

  const bigBang = useCallback(() => {
    engineRef.current?.impulse(0.5, 0.5, 6)
  }, [engineRef])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        bigBang()
      } else if (e.key.toLowerCase() === 'p') {
        setControls((c) => ({ ...c, running: !c.running }))
      } else if (e.key.toLowerCase() === 'r') {
        randomize()
      } else if (e.key.toLowerCase() === 'c') {
        setPanelOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bigBang, randomize])

  const handleCount = useCallback(
    (value: number) => {
      setCount(value)
      engineRef.current?.resize(value)
    },
    [engineRef]
  )

  const handleMatrix = useCallback(
    (i: number, j: number, value: number) => {
      const engine = engineRef.current
      if (!engine) return
      engine.opts.matrix[i][j] = value
      setPreset((p) => {
        const m = p.matrix.map((r) => [...r])
        m[i][j] = value
        return { ...p, matrix: m, id: 'custom', name: p.id === 'custom' ? p.name : 'Custom' }
      })
    },
    [engineRef]
  )

  return (
    <div className="experience">
      <canvas ref={canvasRef} className="field" aria-label="Particle life simulation" />
      <div className="vignette" aria-hidden />

      <IntroOverlay />

      <TopBar
        fps={fps}
        count={count}
        presetName={preset.name}
        running={controls.running}
        onToggleRun={() =>
          setControls((c) => ({ ...c, running: !c.running }))
        }
        onBigBang={bigBang}
        onRandomize={randomize}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />

      <ControlPanel
        open={panelOpen}
        preset={preset}
        presets={PRESETS}
        count={count}
        controls={controls}
        onPreset={applyPreset}
        onCount={handleCount}
        onControls={setControls}
        onMatrix={handleMatrix}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  )
}
