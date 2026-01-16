'use client'

import { useState } from 'react'

const images = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
  'https://images.unsplash.com/photo-1549187774-b4e9b0445b41',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5'
]

export default function Slideshow() {
  const [index, setIndex] = useState(0)

  const prev = () => {
    setIndex((index - 1 + images.length) % images.length)
  }

  const next = () => {
    setIndex((index + 1) % images.length)
  }

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
      <img
        src={images[index]}
        alt="Furniture"
        className="w-full h-full object-cover"
      />

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
      >
        ◀
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
      >
        ▶
      </button>
    </div>
  )
}
