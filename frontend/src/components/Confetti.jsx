import { useEffect, useRef } from 'react'

// Lightweight, dependency-free confetti for the champion reveal. Canvas-based,
// bounded to its container, self-cleaning. Honours prefers-reduced-motion by
// rendering nothing (the gold champion treatment carries the moment instead).
const COLORS = ['#e7bf4a', '#f3f5f8', '#439bf7', '#2dc26b', '#ec4899', '#f97316', '#38bdf8']

function Confetti({ fire }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!fire) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const rect = canvas.parentElement.getBoundingClientRect()
    const W = rect.width
    const H = rect.height
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const N = Math.round(Math.min(160, Math.max(70, W / 8)))
    const parts = Array.from({ length: N }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
      const speed = 6 + Math.random() * 9
      return {
        x: W / 2 + (Math.random() - 0.5) * W * 0.3,
        y: H * 0.42,
        vx: Math.cos(angle) * speed * (0.6 + Math.random()),
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      }
    })

    const start = performance.now()
    const DURATION = 2800
    const gravity = 0.22

    const tick = (now) => {
      const t = now - start
      ctx.clearRect(0, 0, W, H)
      const fade = t > DURATION - 700 ? Math.max(0, (DURATION - t) / 700) : 1
      for (const p of parts) {
        p.vy += gravity
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      if (t < DURATION) rafRef.current = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, W, H)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [fire])

  return <canvas ref={canvasRef} className="bk-confetti" aria-hidden="true" />
}

export default Confetti
