interface EventCardProps {
  title: string
  date: string
  description: string
  image: string
}

export default function EventCard({ title, date, description, image }: EventCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img src={image} alt={title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{date}</p>
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </div>
  )
}
