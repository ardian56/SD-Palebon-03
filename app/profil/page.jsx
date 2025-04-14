'use client';

import Image from 'next/image';

const ProfileSekolah = () => {
  return (
    <div className="w-full bg-white">

      <div className="pt-10">
        <Image
          src="/assets/logo.png" 
          alt="Logo Sekolah"
          className="mx-auto"
          width={150}
          height={150}
        />
      </div>

      <div className="visi pb-10 flex flex-col sm:flex-row sm:px-20 gap-5">
        {/* Visi */}
        <div className="relative w-96 bg-white shadow-sm border border-slate-200 rounded-lg p-3 pb-6 mx-auto">
          <div className="flex justify-center mb-4 mt-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10 text-purple-500"
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
          <div className="flex justify-center mb-3">
            <h5 className="text-slate-800 text-2xl font-semibold">Visi Sekolah</h5>
          </div>
          <div className="p-3 mt-5 border-t border-slate-100 text-center max-h-60 overflow-y-auto
            [&::-webkit-scrollbar-thumb]:rounded-xl
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:rounded-xl
            [&::-webkit-scrollbar-track]:bg-slate-100"
          >
            <p className="text-slate-600 leading-normal font-light mb-4 max-w-lg">
              Terwujudnya peserta didik yang: <br />
              “Mandiri, berprestasi, unggul dalam mutu, berbudaya, dan berakhlak mulia dilandasi iman dan takwa.”
            </p>
          </div>
        </div>

        {/* Misi */}
        <div className="relative w-96 bg-white shadow-sm border border-slate-200 rounded-lg p-3 pb-6 mx-auto">
          <div className="flex justify-center mb-4 mt-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10 text-purple-500"
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
          <div className="flex justify-center mb-3">
            <h5 className="text-slate-800 text-2xl font-semibold">Misi Sekolah</h5>
          </div>
          <div className="p-3 mt-5 border-t border-slate-100 text-center max-h-60 overflow-y-auto
            [&::-webkit-scrollbar-thumb]:rounded-xl
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:rounded-xl
            [&::-webkit-scrollbar-track]:bg-slate-100"
          >
            <p className="text-slate-600 leading-normal font-light mb-4 max-w-lg text-left whitespace-pre-line">
1. Menyelenggarakan pembelajaran dengan menanamkan nilai-nilai keagamaan dan akhlak mulia.  
2. Meningkatkan kemampuan literasi, numerasi, dan partisipasi kegiatan.  
3. Menumbuhkan nilai religious, nasionalis, mandiri, gotong royong.  
4. Mengaktualisasikan karya dan bakat secara nyata.  
5. Menumbuhkan semangat kompetitif yang sportif.  
6. Peduli lingkungan dengan meningkatkan sarana prasarana yang bersih dan nyaman.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileSekolah;
