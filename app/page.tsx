'use client'

import dynamic from 'next/dynamic'

// The experience is fully client-side (canvas + requestAnimationFrame loop).
const Experience = dynamic(() => import('@/components/Experience'), {
  ssr: false,
})

export default function Home() {
  return <Experience />
}
