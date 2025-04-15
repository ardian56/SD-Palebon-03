'use client'
import { useEffect, useState } from 'react'

const images = [
  "/assets/carousel1.jpg",
  "/assets/carousel2.png",
]

export default function Beranda() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 4000) 

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white w-full mt-16">
      {/* Carousel Otomatis */}
      <div className="relative w-full aspect-[16/6] md:aspect-[16/6] overflow-hidden">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          className={`absolute top-0 left-0 w-full h-full 
            ${index === currentSlide ? 'opacity-100' : 'opacity-0'} 
            transition-opacity duration-1000 ease-in-out
            object-cover`}
          alt={`carousel ${index + 1}`}
        />
      ))}

      {/* Tombol navigasi */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
        <button onClick={() => setCurrentSlide((currentSlide - 1 + images.length) % images.length)} className="btn btn-circle bg-white bg-opacity-50">
          ❮
        </button>
        <button onClick={() => setCurrentSlide((currentSlide + 1) % images.length)} className="btn btn-circle bg-white bg-opacity-50">
          ❯
        </button>
      </div>
    </div>


      {/* Sambutan Kepala Sekolah */}
      <div className="contain w-full px-10">
        <a href="#" className="flex flex-col items-center p-2 mx-auto mt-10 bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row hover:bg-gray-100">
          <img
            className="object-cover w-full md:w-[400px] h-96 rounded-t-lg md:rounded-none md:rounded-s-lg"
            src="/assets/kepalaSekolah.jpeg"
            alt="kepala sekolah"
          />
          <div className="flex flex-col justify-between p-4 leading-normal">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-center text-gray-800">
              Sambutan Kepala Sekolah
            </h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              Assalamualaikum Wr. Wb.
              <br /><br />
              Puji syukur alhamdulillah senantiasa kami panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa atas limpahan karunia dan rahmat-Nya sehingga website SDN Palebon 03, Pedurungan Semarang dapat aktif kembali. Saya menyadari bahwa website sekolah ini sangatlah penting di era global saat ini. Cepatnya perkembangan pengetahuan dan teknologi informasi saat ini tidak dapat dipungkiri bahwa keberadaan website sangatlah penting. Website dapat digunakan sebagai sarana informasi dan komunikasi pihak sekolah dengan siswa, orang tua/wali murid, komite sekolah, alumni, dan stake holder secara luas.
              <br /><br />
              Selain memberikan informasi tentang SDN Palebon 03, website ini juga digunakan untuk memfasilitasi civitas academia di SDN Palebon 03 untuk selalu mengembangkan kompetensinya melalui pembuatan website ini. Tentu saja hal ini dilakukan dengan harapan semua stake holder di SDN Palebon 03 untuk dapat mendarma baktikan semua potensi yang ada demi kemajuan dunia pendidikan.
              <br /><br />
              Saya percaya apapun bentuk dan sumbangsih yang diberikan jika dilandasi dengan niat yang tulus tanpa mengharapkan imbalan akan menghasilkan generasi penerus bangsa yang lebih siap dan insya Allah merupakan bagian dari ibadah, Aamiin.
            </p>
          </div>
        </a>
      </div>

      {/* Sambutan Manajemen Sekolah */}
      <div className="contain w-full px-10 mb-20">
        <a href="#" className="flex flex-col items-center p-2 mx-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row hover:bg-gray-100">
          <div className="flex flex-col justify-between p-4 leading-normal">
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              Dalam sistem Manajemen Berbasis Sekolah (MBS) atau ketatakelolaan sekolah berbasis manajemen, kami berusaha terus meningkatkan kinerja dan profesionalisme demi terwujudnya pelayanan prima dalam cakupan Lembaga Pendidikan SDN Palebon 03. Kami mencoba menerapkan sistem teknologi komputerisasi agar transparansi pengelolaan pendidikan terwujud secara optimal.
              <br /><br />
              Tentu saja sebuah sistem akan bermanfaat dan berdaya guna tinggi jika didukung dan direalisasikan oleh semua komponen di SDN Palebon 03, baik sistem manajerial, akademik, pelayanan publik, prestasi, moralitas, dan semua hal yang berinteraksi di dalamnya.
              <br /><br />
              Oleh karena itu, saya berharap semua komponen SDN Palebon 03: PTK, siswa, komite sekolah, orang tua/wali siswa, alumni, dan stake holder lainnya mendukung dan berkontribusi dalam website ini.
              <br /><br />
              Akhirnya, kami mengharapkan masukan berupa saran, kritik yang membangun terhadap website ini agar kami terus belajar dan meng-update diri sehingga tampilan, isi, dan mutu website akan terus berkembang lebih baik sekaligus dapat dimanfaatkan dan bermanfaat bagi PTK, siswa, komite sekolah, orang tua/wali siswa, alumni, stake holder berkait, dan masyarakat luas pada umumnya. Aamiin Ya Robbal ‘Alamin.
              <br /><br />
              Wassalamualaikum Wr. Wb.
            </p>
          </div>
        </a>
      </div>
    </div>
  )
}
