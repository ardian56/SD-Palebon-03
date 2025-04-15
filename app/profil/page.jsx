'use client';

import Image from 'next/image';
import { IoSchool } from "react-icons/io5";
const ProfileSekolah = () => {
  return (
    <div className="w-full bg-white/90 backdrop-blur-md min-h-screen py-12 px-4 sm:px-10">
      
      {/* Logo dan Judul */}
      <div className="flex flex-col items-center text-center mb-12 transition-all duration-300">
        <div className="relative">
          <Image
            src="/assets/logo.png"
            alt="Logo Sekolah"
            className="rounded-full shadow-xl ring-4 ring-white"
            width={220}
            height={220}
          />
          <div className="absolute -inset-1 rounded-full blur-xl  opacity-30 animate-pulse" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-red-600">
          Profil Sekolah
        </h1>
        <p className="text-slate-600 mt-3 max-w-xl">
          Visi dan misi sebagai pedoman dalam membentuk generasi berakhlak mulia, berprestasi, dan berbudaya.
        </p>
      </div>

      {/* Visi & Misi Cards */}
      <div className="flex flex-col sm:flex-row justify-center items-stretch gap-10 sm:px-20">
        
        {/* Visi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all w-full sm:w-96">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21
                  8.25 8.25 0 0 1 6.038 7.047 8.287 8.287
                  0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867
                  8.21 8.21 0 0 0 3 2.48Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 0 0 .495-7.468
                  5.99 5.99 0 0 0-1.925 3.547
                  5.975 5.975 0 0 1-2.133-1.001
                  A3.75 3.75 0 0 0 12 18Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">Visi Sekolah</h2>
          <div className="border-t pt-4 text-slate-600 text-center max-h-60 overflow-y-auto
            [&::-webkit-scrollbar-thumb]:rounded-xl
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-slate-100"
          >
            <p className="leading-relaxed font-light">
              Terwujudnya peserta didik yang: <br />
              <strong className="text-slate-700">
                “Mandiri, berprestasi, unggul dalam mutu, berbudaya, dan berakhlak mulia dilandasi iman dan takwa.”
              </strong>
            </p>
          </div>
        </div>

        {/* Misi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all w-full sm:w-96">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21
                  8.25 8.25 0 0 1 6.038 7.047 8.287 8.287
                  0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867
                  8.21 8.21 0 0 0 3 2.48Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 0 0 .495-7.468
                  5.99 5.99 0 0 0-1.925 3.547
                  5.975 5.975 0 0 1-2.133-1.001
                  A3.75 3.75 0 0 0 12 18Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">Misi Sekolah</h2>
          <div className="border-t pt-4 text-slate-600 max-h-60 overflow-y-auto text-sm text-left
            whitespace-pre-line
            [&::-webkit-scrollbar-thumb]:rounded-xl
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-slate-100"
          >
            <p className="leading-relaxed font-light">
              1. Menanamkan nilai-nilai keagamaan dan akhlak mulia. <br />
              2. Meningkatkan literasi, numerasi, dan partisipasi aktif. <br />
              3. Menumbuhkan sikap religious, nasionalis, mandiri, gotong royong. <br />
              4. Mengembangkan karya dan bakat siswa secara nyata. <br />
              5. Mendorong semangat kompetisi yang sportif. <br />
              6. Peduli lingkungan melalui fasilitas yang bersih dan nyaman.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileSekolah;
