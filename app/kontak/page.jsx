'use client';

import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';

const Kontak = () => {
  return (
    <div className="w-full bg-white/90 backdrop-blur-md min-h-screen">
      <section className="pt-12">
        <div className="container px-6 py-12 mx-auto text-slate-800">
          <div className="text-center">
            <h1 className="mt-2 text-2xl font-bold text-red-600 md:text-3xl border-b border-slate-300 inline-block">
              Kontak Kami
            </h1>
            <p className="mt-3 text-slate-600">Senin - Kamis : Pukul 07.30 - 15.30 WIB.</p>
            <p className="mt-1 text-slate-600">Jumat : Pukul 07.00 - 11.30 WIB.</p>
          </div>

          <div className="grid grid-cols-1 gap-12 mt-10 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {/* Email */}
              <div className="border rounded-2xl shadow-lg p-4 hover:shadow-xl transition">
                <span className="inline-block p-3 text-red-600 rounded-full bg-red-100">
                  <Mail className="w-5 h-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-800">Email</h2>
                <p className="mt-2 text-sm text-slate-600">Hubungi email kami dibawah ini.</p>
                <p className="mt-2 text-sm text-red-600">sdnpalebontiga@gmail.com</p>
              </div>

              {/* Alamat */}
              <div className="border rounded-2xl shadow-lg p-4 hover:shadow-xl transition">
                <span className="inline-block p-3 text-red-600 rounded-full bg-red-100">
                  <MapPin className="w-5 h-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-800">Alamat</h2>
                <p className="mt-2 text-sm text-red-600">
                  Jl. Brigjen S. Sudiarto No. 330 Kel. Palebon Kec. Pedurungan, Kota Semarang Jawa Tengah 50246
                </p>
              </div>

              {/* Telepon */}
              <div className="border rounded-2xl shadow-lg p-4 hover:shadow-xl transition">
                <span className="inline-block p-3 text-red-600 rounded-full bg-red-100">
                  <Phone className="w-5 h-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-800">Telepon</h2>
                <p className="mt-2 text-sm text-slate-600">Senin - Jumat 08.00 - 17.00 WIB</p>
                <p className="mt-2 text-sm text-red-600">+62 24 6724037</p>
              </div>
            </div>

            {/* Peta */}
            <div className="overflow-hidden rounded-2xl shadow-lg lg:col-span-2">
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
                className="h-96 lg:h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Kontak;
