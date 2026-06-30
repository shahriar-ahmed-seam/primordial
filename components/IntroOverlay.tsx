'use client'

import { useEffect, useState } from 'react'
import { MousePointer2, Keyboard, SlidersHorizontal } from 'lucide-react'

export default function IntroOverlay() {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 4200)
    const t2 = setTimeout(() => setPhase('gone'), 5200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={`intro ${phase}`} onClick={() => setPhase('out')}>
      <div className="intro-inner">
        <p className="eyebrow">An emergent universe</p>
        <h1>PRIMORDIAL</h1>
        <p className="tagline">
          Thousands of particles. A handful of rules. Watch life assemble itself.
        </p>
        <div className="intro-hints">
          <span>
            <MousePointer2 size={15} /> Hold to disturb the field
          </span>
          <span>
            <SlidersHorizontal size={15} /> Open Controls to rewrite physics
          </span>
          <span>
            <Keyboard size={15} /> Big Bang to reset the cosmos
          </span>
        </div>
      </div>
    </div>
  )
}
