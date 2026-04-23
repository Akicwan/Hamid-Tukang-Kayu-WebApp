'use client'

import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#2f241d] font-sans">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#3d2b1f] text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
          <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200/90 font-semibold mb-4">
              About Hamid Tukang Kayu
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
              A heritage shaped
              <br />
              by craftsmanship
            </h1>
            <p className="max-w-3xl text-sm md:text-lg leading-8 text-stone-200/95">
              From humble beginnings in Johor to becoming one of the earliest Malay
              furniture makers in Batu Pahat, the story of Hamid Tukang Kayu is one
              of perseverance, skill, and lasting legacy.
            </p>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#9b7b5f] font-semibold mb-3">
                Our Story
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-[#2f241d]">
                We’ve Been Doing
                <br />
                Wood Work Since 1960
              </h2>

              <div className="space-y-6 text-sm md:text-base leading-8 text-[#6d5a4c]">
                <p>
                  Tuan Haji Abdul Hamid bin Ahmad was born in 1932 in Parit Hj Mohammad
                  Bagan, Rengit, a small town located within the district of Batu Pahat
                  in the state of Johor. He had indulged himself in the art of carpentry
                  since his early school days, or more precisely, since he was at the
                  tender age of eight.
                </p>

                <p>
                  His talents in carpentry were initially devoted to helping his late
                  grandfather, Allahyarham Hj Taib, make doors, wooden planks for stairs,
                  as well as repair houses.
                </p>

                <p>
                  Tuan Haji Abdul Hamid received his first education in Sekolah Merlong
                  Rengit in 1941. However, his education lasted for only two years until
                  he was eleven years old in 1943, when the brutal Japanese occupation
                  of Malaya began.
                </p>
              </div>
            </div>

            <div className="relative w-full h-full min-h-[420px]">
              <img
                src="/founder.jpg"
                alt="Allahyarham Tuan Haji Abdul Hamid"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm md:text-base font-semibold">
                  Allahyarham Tuan Hj Abdul Hamid
                </p>
                <p className="text-xs md:text-sm text-white/80">
                  Founder of Hamid Tukang Kayu
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OUR HISTORY - ARCHIVE STYLE */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <div className="mb-10">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#9b7b5f] font-semibold mb-3">
              Our History
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2f241d]">
              A story preserved through work, resilience, and heritage
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
            {/* LEFT - LONG TEXT */}
            <div className="space-y-8 text-sm md:text-base leading-9 text-[#5f5246]">
              <p>
                Throughout and following the Japanese occupation of Tanah Melayu,
                Tuan Haji Abdul Hamid seek solace and found peace in his love and
                passion for carpentry. This passion and enthusiasm for carpentry has
                greatly assisted him in going through the hardships of life during
                and post-Japanese occupation. Building houses was one of the things
                that Tuan Haji Abdul Hamid specialized in before he started designing
                and creating furniture. His skill in the construction of houses was
                in very popular demand at that time, that often, he would receive
                new orders from customers while another customer’s house was still
                under construction and far from its completion. It was while he was
                deep in the business of house construction that Tuan Haji Abdul Hamid
                began to expand his interest in carpentry and venture into the creation
                of home furniture such as dining tables, armoires, beds, and sofas.
              </p>

              <p>
                As his interest in creating furniture intensified and proliferated over
                the years, Tuan Haji Abdul Hamid established a furniture business known
                today as Perusahaan Tukang Kayu A. Hamid Sdn Bhd. It was the first Malay
                furniture to be established in the town of Batu Pahat, and possibly one
                of the earliest Malay furniture business that sprang up in the state of
                Johor. Responses from customers were very invigorating, the number of
                orders for furniture made by customers tend to be so overwhelming, that
                Tuan Haji Abdul Hamid often had to work late into the night, racing
                against time in order to reach customer’s deadlines. At this time, his
                workshop was located in Belahan Tampok, which is about eight kilometers
                from the main road of Rengit Pontian.
              </p>

              <p>
                His profound interest in carpentry was largely encouraged by his family
                members, relatives, as well as the neighbors and the locals, from whom
                he received a great amount of respect for his works, and it was also
                boosted by the considerable amount of income earned from his furniture.
                External influences from those close to him may have also proliferated
                his interest in carpentry; his cousin, Allahyarham Hj Ihsan, as well as
                his neighbor, Allahyarham Hj Suphie, were also said to be exceptional in
                constructing houses and making furniture. In 1952, Tuan Haji Abdul Hamid
                moved his workshop from Belahan Tampok to the small town of Rengit, where
                he had rented a piece of land on which he constructed his new furniture
                workshop. Business in Rengit boomed even harder than when he was in
                Belahan Tampok; he found himself working increasingly harder in order to
                meet the demands of customers in Rengit.
              </p>

              <p>
                In his early involvement in the furniture business, due to the lack of
                equipment suppliers, Tuan Haji Abdul Hamid was also compelled to take
                frequent trips to Singapore by hitchhiking a truck owned by a Chinese
                tauke that transported bananas.
              </p>

              <p>
                Tuan Haji Abdul Hamid had also seek advice and counsel from RIDA (MARA)
                while he was still new in the furniture business. The MARA Officer at
                that time, Mr. Syed Rahman, and a European engineer of RIDA has paid a
                visit to his furniture workshop in Rengit. Following this visit, RIDA
                later sent Tuan Haji Abdul Hamid for a two-week course on carpentry in
                Deithelm (a renowned furniture factory in Singapore). RIDA also approved
                his loan of RM 1,200, which was contributed towards the purchase of
                machines appropriate for producing furniture.
              </p>

              <p>
                The machines purchased were planer (mesin ketam), saw and drill. These
                machines had to be bought in Singapore, as they were unavailable anywhere
                near Rengit at that time. Tuan Haji Abdul Hamid also attended several
                courses and seminars on carpentry organized by RIDA in Kuala Lumpur.
                Even though his customer base in Rengit was strong, steady and still
                expanding, due to the total absence of electricity and his determined
                will to take his business to a more commendable level and transform it
                into an empire, in the year 1970, Tuan Haji Abdul Hamid decided to move
                his business as well as his family to the town of Batu Pahat where there
                was a bigger possibility of achieving his ambitious goals for his business.
              </p>

              <p>
                The land on which he built his furniture factory which still stands to
                this day, in the very same location as when it was first built, was rented
                at the price of RM 70 per month. After ten years of renting this land,
                however, the landlord eventually agreed to sell this land off to
                Tuan Haji Abdul Hamid.
              </p>

              <p>
                Tuan Haji Abdul Hamid had been active in attracting Malay youth to indulge
                themselves in the art of carpentry. As an employer, Tuan Haji Abdul Hamid
                did not only employ for the sake of keeping the factory and therefore the
                business running, but also to teach and train his employees how to make
                furniture. He has introduced the concept of simultaneous learning and
                working.
              </p>

              <p>
                Currently, furniture produced by Perusahaan Tukang Kayu A. Hamid Sdn Bhd
                is marketed not only in the area around Lembah Kelang and in its birth
                state of Johor, but they are also available in cities as far as Brunei
                Darussalam.
              </p>

              <p>
                Tuan Haji Abdul Hamid’s business was not restricted to the production
                and selling of furniture only. He also bought several pieces of land on
                which he built houses for the purpose of selling it. He also produced
                water tanks and later expanded into plantation, land, and property
                management.
              </p>

              <p>
                Allahyarham Tuan Haji Abdul Hamid was married to Allahyarhamah Hajah
                Zabeadah binti Rasiman, and blessed with eight children and 38 grandchildren,
                all of whom are proud of the endeavors that he took to establish himself
                as a determined and successful individual, and to carry his glorious lineage.
                On 19 July 2014, Allahyarham Tuan Haji Abdul Hamid died at The Southern
                Hospital, surrounded by his family and was buried at Taman Banang Cemetery
                in Batu Pahat, Johor.
              </p>
            </div>

            {/* RIGHT - STACKED IMAGES */}
            <div className="space-y-8">
              <figure className="border border-[#d8cec3] bg-[#f7f2ec] p-2">
                <img
                  src="/about-2.jpg"
                  alt="Hamid Perusahaan Tukang Kayu – Rengit Factory 1960s"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-center text-xs text-[#6d5a4c] mt-3 pb-1">
                  Hamid Perusahaan Tukang Kayu – Rengit Factory 1960s
                </figcaption>
              </figure>

              <figure className="border border-[#d8cec3] bg-[#f7f2ec] p-2">
                <img
                  src="/about-3.jpg"
                  alt="Hamid Tukang Kayu Rengit 1960s Working on Table"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-center text-xs text-[#6d5a4c] mt-3 pb-1">
                  Hamid Tukang Kayu Rengit 1960s Working on Table
                </figcaption>
              </figure>

              <figure className="border border-[#d8cec3] bg-[#f7f2ec] p-2">
                <img
                  src="/about-4.jpg"
                  alt="Hamid Tukang Kayu Apprentice, Learning and Working Program 1960s"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-center text-xs text-[#6d5a4c] mt-3 pb-1">
                  Hamid Tukang Kayu Apprentice, Learning and Working Program 1960s
                </figcaption>
              </figure>

              <figure className="border border-[#d8cec3] bg-[#f7f2ec] p-2">
                <img
                  src="/about-5.jpg"
                  alt="Hamid Perusahaan Tukang Kayu – Sijil Tamat Latihan"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-center text-xs text-[#6d5a4c] mt-3 pb-1">
                  Hamid Perusahaan Tukang Kayu – Sijil Tamat Latihan
                </figcaption>
              </figure>

              <figure className="border border-[#d8cec3] bg-[#f7f2ec] p-2">
                <img
                  src="/about-6.jpg"
                  alt="Hamid Perusahaan Tukang Kayu – New Batu Pahat Factory 1970"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-center text-xs text-[#6d5a4c] mt-3 pb-1">
                  Hamid Perusahaan Tukang Kayu – New Batu Pahat Factory 1970
                </figcaption>
              </figure>

              <figure className="border border-[#d8cec3] bg-[#f7f2ec] p-2">
                <img
                  src="/founder2.jpg"
                  alt="Allahyarham Tuan Hj Abdul Hamid and his wife Allahyarhamah Bonda Hjh Zabeadah in front of Showroom in the early 80’s"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-center text-xs text-[#6d5a4c] mt-3 pb-1">
                  Allahyarham Tuan Hj Abdul Hamid and his wife Allahyarhamah Bonda Hjh
                  Zabeadah in front of Showroom in the early 80’s
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}