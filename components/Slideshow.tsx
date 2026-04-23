'use client'

import { useEffect, useState } from 'react'

interface SlideshowProps {
  images?: string[]
  showArrows?: boolean
  autoPlay?: boolean
  interval?: number
}

export default function Slideshow({
  images = [],
  showArrows = false,
  autoPlay = true,
  interval = 4000,
}: SlideshowProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, images, interval])

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  if (!images.length) {
    return <div className="w-full h-full bg-stone-200" />
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, i) => (
        <img
          key={i}
          src={image}
          alt={`Slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full z-10"
          >
            ◀
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full z-10"
          >
            ▶
          </button>
        </>
      )}
    </div>
  )
}