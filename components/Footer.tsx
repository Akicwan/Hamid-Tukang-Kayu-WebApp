import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#3d2b1f] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
        <div>
          <h3 className="font-bold text-amber-400 mb-3 uppercase tracking-wider">
            Head Office & Factory
          </h3>
          <p className="font-semibold">Perusahaan Tukang Kayu A. Hamid Sdn Bhd</p>
          <p>Batu 1, Jalan Baru Peserai</p>
          <p>83000 Batu Pahat Johor</p>
          <p className="mt-2">Telephone : 07-4138808</p>
          <p>Fax : 07-4137808</p>
          <p className="mt-2">Sat - Thu – 8 am – 5 pm</p>
          <a
            href="https://wa.me/601111223922"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 block mt-2 hover:underline"
          >
            WhatsApp
          </a>
        </div>

        <div>
          <h3 className="font-bold text-amber-400 mb-3 uppercase tracking-wider">
            Putrajaya Branch
          </h3>
          <p className="font-semibold">Hamid Tukang Kayu</p>
          <p>No 5, Jalan Pinggiran Putra 3/5</p>
          <p>Desa Pinggiran Putra</p>
          <p>43650 Bangi Selangor</p>
          <p className="mt-2">Telephone/Fax : 03-89209431</p>
          <p className="mt-2">Mon – Fri: 11 am – 6.30pm</p>
          <a
            href="https://wa.me/60162819826"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 block mt-2 hover:underline"
          >
            WhatsApp
          </a>
        </div>

        <div>
          <h3 className="font-bold text-amber-400 mb-3 uppercase tracking-wider">
            Email
          </h3>
          <p className="font-semibold">info@hamidtukangkayu.com</p>
        </div>
      </div>

      <div className="text-center text-xs text-stone-300 border-t border-white/10 py-4">
        © {new Date().getFullYear()} Hamid Tukang Kayu. All rights reserved.
      </div>
    </footer>
  )
}