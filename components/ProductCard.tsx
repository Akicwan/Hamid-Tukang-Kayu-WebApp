type Product = {
  id: number
  name: string
  price: number
  image: string
}

export default function ProductCard({ name, price, image }: Product) {
  return (
    <div className="rounded-xl border overflow-hidden hover:shadow-lg transition">
      <img
        src={image}
        alt={name}
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-gray-600">RM {price}</p>
      </div>
    </div>
  )
}
