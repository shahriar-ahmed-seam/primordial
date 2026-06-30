'use client'

import { useEffect, useRef } from 'react'
import { ParticleLife, PALETTE, type EngineOptions } from './engine'

export interface FieldControls {
  running: boolean
  trails: number // 0..1 — higher keeps longer light trails
  glow: number // particle radius multiplier
  pointerStrength: number
}

interface UseParticleFieldArgs {
  options: EngineOptions
  controls: FieldControls
  onFps?: (fps: number) => void
}

/**
 * Drives a ParticleLife engine and paints it onto a 2D canvas with additive
 * glow and motion trails. Returns the canvas ref plus an imperative handle for
 * live control without tearing down the simulation.
 */
export function useParticleField({ options, controls, onFps }: UseParticleFieldArgs) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<ParticleLife | null>(null)
  const controlsRef = useRef(controls)
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  })
  const spritesRef = useRef<HTMLCanvasElement[]>([])

  controlsRef.current = controls

  // Build a cached glow sprite per species (radial gradient → fast drawImage).
  const buildSprites = (radius: number) => {
    const sprites: HTMLCanvasElement[] = []
    const size = Math.ceil(radius * 2)
    for (let s = 0; s < PALETTE.length; s++) {
      const c = document.createElement('canvas')
      c.width = size
      c.height = size
      const ctx = c.getContext('2d')!
      const [r, g, b] = PALETTE[s]
      const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius)
      const col = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`
      grad.addColorStop(0, `rgba(${col}, 1)`)
      grad.addColorStop(0.35, `rgba(${col}, 0.55)`)
      grad.addColorStop(1, `rgba(${col}, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
      sprites.push(c)
    }
    spritesRef.current = sprites
  }

  // Create / recreate the engine when structural options change.
  useEffect(() => {
    engineRef.current = new ParticleLife(options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })!

    let raf = 0
    let last = performance.now()
    let fpsAcc = 0
    let fpsFrames = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#04060d'
      ctx.fillRect(0, 0, w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    buildSprites(48)

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const engine = engineRef.current
      if (!engine) return
      const c = controlsRef.current
      let dt = (now - last) / 1000
      last = now
      if (dt > 0.05) dt = 0.05 // clamp after tab switches

      // FPS sampling.
      fpsAcc += dt
      fpsFrames++
      if (fpsAcc >= 0.5) {
        onFps?.(Math.round(fpsFrames / fpsAcc))
        fpsAcc = 0
        fpsFrames = 0
      }

      if (c.running) {
        const p = pointerRef.current
        engine.step(
          dt,
          p.active ? { x: p.x, y: p.y, strength: c.pointerStrength } : null
        )
      }

      const w = canvas.clientWidth
      const h = canvas.clientHeight

      // Fade previous frame for motion trails.
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(4, 6, 13, ${1 - c.trails})`
      ctx.fillRect(0, 0, w, h)

      // Additive glow pass.
      ctx.globalCompositeOperation = 'lighter'
      const sprites = spritesRef.current
      const r = 48 * c.glow
      const d = r * 2
      const scale = Math.min(w, h)
      const offX = (w - scale) / 2
      const offY = (h - scale) / 2
      const { px, py, type, count } = engine
      for (let i = 0; i < count; i++) {
        const x = offX + px[i] * scale
        const y = offY + py[i] * scale
        ctx.drawImage(sprites[type[i]], x - r, y - r, d, d)
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pointer wiring.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const toNorm = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const scale = Math.min(rect.width, rect.height)
      const offX = (rect.width - scale) / 2
      const offY = (rect.height - scale) / 2
      return {
        x: (clientX - rect.left - offX) / scale,
        y: (clientY - rect.top - offY) / scale,
      }
    }
    const move = (e: PointerEvent) => {
      const n = toNorm(e.clientX, e.clientY)
      pointerRef.current.x = n.x
      pointerRef.current.y = n.y
    }
    const down = (e: PointerEvent) => {
      const n = toNorm(e.clientX, e.clientY)
      pointerRef.current = { x: n.x, y: n.y, active: true }
    }
    const up = () => {
      pointerRef.current.active = false
    }
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return { canvasRef, engineRef }
}
