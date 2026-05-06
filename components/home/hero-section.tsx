'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let w = 0
    let h = 0

    interface Particle {
      x: number
      y: number
      r: number
      speed: number
      opacity: number
      opacityDir: number
    }

    const particles: Particle[] = []

    function resize() {
      if (!canvas) return
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }

    function spawn(): Particle {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 60,
        r: Math.random() * 3 + 1.5,
        speed: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.25 + 0.05,
        opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
      }
    }

    function init() {
      resize()
      particles.length = 0
      const count = Math.floor((w * h) / 14000)
      for (let i = 0; i < count; i++) {
        const p = spawn()
        p.y = Math.random() * h
        particles.push(p)
      }
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y -= p.speed
        p.opacity += p.opacityDir
        if (p.opacity > 0.3) p.opacityDir = -Math.abs(p.opacityDir)
        if (p.opacity < 0.03) p.opacityDir = Math.abs(p.opacityDir)

        if (p.y + p.r < 0) {
          particles[i] = spawn()
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(10, 22, 40, ${p.opacity})`
        ctx.fill()
      }

      animFrame = requestAnimationFrame(draw)
    }

    init()
    draw()

    const ro = new ResizeObserver(() => {
      init()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animFrame)
      ro.disconnect()
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#F2F5F8] py-20 sm:py-28 lg:py-36">
      {/* Animated particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <span className="inline-block rounded-full bg-[#0A1628]/10 px-4 py-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A1628]">
          Research-Grade Compounds
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0A1628] sm:text-5xl lg:text-[3.75rem]">
          High Quality, Lab&nbsp;Tested,
          <br />
          Affordable&nbsp;Compounds.
        </h1>

        {/* Sub-copy */}
        <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-[#0A1628]/65 sm:text-lg">
          Purity you can count on. Premium research compounds certified to 99%+&nbsp;purity.
          Relied on by researchers worldwide. Shipped fast from&nbsp;U.S.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="hero-shop-now-enter group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden rounded-full bg-[#0A1628] px-10 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#132744] hover:shadow-xl active:scale-[0.97]"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-white/10 transition-transform duration-500 ease-out group-hover:scale-x-100" aria-hidden />
            <span className="relative z-10">SHOP NOW →</span>
          </Link>
          <Link
            href="/shop"
            className="text-sm font-semibold text-[#0A1628]/70 underline-offset-4 transition-colors hover:text-[#0A1628] hover:underline"
          >
            View COAs →
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-14 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-[#0A1628]/10 pt-10">
          {[
            { value: '99%+', label: 'Purity' },
            { value: '$250+', label: 'Free Shipping' },
            { value: 'Lab', label: 'Certified' },
            { value: 'US', label: 'USA' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-xl font-extrabold text-[#0A1628]">{stat.value}</span>
              <span className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-widest text-[#0A1628]/50">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
