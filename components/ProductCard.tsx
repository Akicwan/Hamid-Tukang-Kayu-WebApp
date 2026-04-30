interface ProductCardProps {
  name: string
  price: number
  image: string
  description?: string
}

export default function ProductCard({
  name,
  price,
  image,
  description,
}: ProductCardProps) {
  return (
    <div className="group bg-white transition-all duration-300 hover:-translate-y-2">
      <div className="bg-[#f7f3ed] aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={name}
         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-bold uppercase text-[#2f241d] leading-tight">
          {name}
        </h3>

        {description && (
          <p className="text-sm text-stone-600 mt-1 line-clamp-2">
            {description}
          </p>
        )}

        <p className="text-xl font-bold text-[#2f241d] mt-3 transition-colors duration-300 group-hover:text-amber-700">
          RM{price}
        </p>
      </div>
    </div>
  )
}