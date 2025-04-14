'use client';

const Kontak = () => {
  return (
    <div className="w-full bg-white min-h-screen">

      <section className="bg-white pt-20">
        <div className="container px-6 py-12 mx-auto">
          <div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-800 md:text-3xl border-b border-gray-300">
              Kontak Kami
            </h1>
            <p className="mt-3 text-gray-500">Senin - Kamis : Pukul 07.30 - 15.30 WIB.</p>
            <p className="mt-1 text-gray-500">Jumat : Pukul 07.00 - 11.30 WIB.</p>
          </div>

          <div className="grid grid-cols-1 gap-12 mt-10 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-1">
              {/* Email */}
              <div className="border rounded-md shadow p-3">
                <span className="inline-block p-3 text-blue-500 rounded-full bg-blue-100/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25...Z" />
                  </svg>
                </span>
                <h2 className="mt-4 text-base font-medium text-gray-800">Email</h2>
                <p className="mt-2 text-sm text-gray-500">Hubungi email kami dibawah ini.</p>
                <p className="mt-2 text-sm text-blue-500">sdnpalebontiga@gmail.com</p>
              </div>

              {/* Alamat */}
              <div className="border rounded-md shadow p-3">
                <span className="inline-block p-3 text-blue-500 rounded-full bg-blue-100/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0...Z" />
                  </svg>
                </span>
                <h2 className="mt-4 text-base font-medium text-gray-800">Alamat</h2>
                <p className="mt-2 text-sm text-blue-500">
                  Jl. Brigjen S. Sudiarto No. 330 Kel. Palebon Kec. Pedurungan, Kota Semarang Jawa Tengah 50246
                </p>
              </div>

              {/* Telepon */}
              <div className="border rounded-md shadow p-3">
                <span className="inline-block p-3 text-blue-500 rounded-full bg-blue-100/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284...Z" />
                  </svg>
                </span>
                <h2 className="mt-4 text-base font-medium text-gray-800">Telepon</h2>
                <p className="mt-2 text-sm text-gray-500">Senin - Jumat 08.00 - 17.00 WIB</p>
                <p className="mt-2 text-sm text-blue-500">+62 24 6724037</p>
              </div>
            </div>

            {/* Peta */}
            <div className="overflow-hidden rounded-lg lg:col-span-2 h-96 lg:h-auto">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                title="map"
                marginHeight="0"
                marginWidth="0"
                scrolling="no"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.0034077096047!2d110.4638564131393!3d-7.008880570595546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708cf961a1fed1%3A0x37a0f9b8581baa5!2sSDN%20Palebon%2003!5e0!3m2!1sid!2sid!4v1623383791164!5m2!1sid!2sid"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Kontak;
