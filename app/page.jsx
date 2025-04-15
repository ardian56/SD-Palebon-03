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
    <div className="bg-white w-full">

      {/* Carousel Otomatis */}
      <div className="relative w-full aspect-[16/6] overflow-hidden">
        {/* Background blur */}
        <img
          src={images[currentSlide]}
          alt="background blur"
          className="absolute top-0 left-0 w-full h-full object-cover filter blur-md scale-110 opacity-70"
        />

        {/* Foreground image (kecil) */}
        <div className="relative z-10 flex justify-center items-center h-full">
          <img
            src={images[currentSlide]}
            alt={`carousel ${currentSlide + 1}`}
            className="w-[70%] h-[80%] object-cover rounded-xl shadow-lg transition-opacity duration-1000 ease-in-out"
          />
        </div>

        {/* Tombol navigasi */}
        <div className="absolute inset-0 flex items-center justify-between px-4 z-20">
          <button 
            onClick={() => setCurrentSlide((currentSlide - 1 + images.length) % images.length)} 
            className="btn btn-circle  text-white -600 hover:bg-blue-500 hover:text-white transition duration-300"
          >
            ❮
          </button>
          <button 
            onClick={() => setCurrentSlide((currentSlide + 1) % images.length)} 
            className="btn btn-circle  text-white-600 hover:bg-blue-500 hover:text-white transition duration-300"
          >
            ❯
          </button>
        </div>
      </div>

      {/* Sambutan Kepala Sekolah */}
      <div className="contain w-full px-10 py-10 bg-gradient-to-r from-blue-50 to-white">
        <a href="#" className="flex flex-col items-center p-2 mx-auto bg-white border border-gray-200 rounded-lg shadow-lg md:flex-row hover:bg-gray-100 transition">
          <img
            className="object-cover w-full md:w-[400px] h-96 rounded-t-lg md:rounded-none md:rounded-l-lg shadow-lg"
            src="/assets/kepalaSekolah.jpeg"
            alt="kepala sekolah"
          />
          <div className="flex flex-col justify-between p-4 leading-normal">
            <h5 className="mb-4 text-2xl font-bold text-center text-red-800">Sambutan Kepala Sekolah</h5>
            <p className="text-gray-700 text-justify">
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
      <div className="contain w-full px-10 py-10 bg-gradient-to-r from-blue-50 to-white">
        <a href="#" className="flex flex-col items-center p-2 mx-auto bg-white border border-gray-200 rounded-lg shadow-lg md:flex-row hover:bg-gray-100 transition">
          <div className="flex flex-col justify-between p-4 leading-normal">
            <p className="text-gray-700 text-justify">
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
