type CategoryCardProps = {
  name: string
}

export default function CategoryCard({ name }: CategoryCardProps) {
  return (
    <div className="cursor-pointer rounded-xl border p-6 text-center hover:shadow-md transition">
      <h3 className="font-semibold">{name}</h3>
    </div>
  )
}
