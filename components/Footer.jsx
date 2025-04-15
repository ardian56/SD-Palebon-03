'use client'
import { FaInstagramSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io5";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import Image from 'next/image';

const Footer = () => {
  return (
    <div className="w-full">
      <div className="w-full flex flex-col sm:flex-row justify-between bg-white bg-opacity-90 px-10 pt-20 pb-10 shadow backdrop-blur-lg backdrop-saturate-150 text-slate-800">
        <div className="cont flex flex-col mb-6 sm:mb-0">
          <h3 className="border-b-2 border-red-500 text-xl font-bold mb-4 pb-1">Tautan</h3>
          <a href="#" className="hover:text-red-600 transition-colors">{"> Kemendikbud"}</a>
          <a href="#" className="hover:text-red-600 transition-colors">{"> Dinas Pendidikan"}</a>
        </div>

        <div className="cont flex flex-col mb-6 sm:mb-0">
          <h3 className="border-b-2 border-red-500 text-xl font-bold mb-4 pb-1">Ikuti Kami</h3>
          <div className="flex flex-row space-x-4">
            <a href="#" className="text-4xl text-slate-700 hover:text-red-600 transition-colors"><FaInstagramSquare /></a>
            <a href="#" className="text-4xl text-slate-700 hover:text-red-600 transition-colors"><IoLogoYoutube /></a>
          </div>
        </div>

        <div className="cont flex flex-col">
          <h3 className="border-b-2 border-red-500 text-xl font-bold mb-4 pb-1">Kontak</h3>
          <a href="mailto:sdnpalebontiga@gmail.com" className="flex items-start mb-2 text-slate-700 hover:text-red-600 transition-colors">
            <MdEmail className="mt-1 mr-2" /> sdnpalebontiga@gmail.com
          </a>
          <p className="flex items-start mb-2 text-slate-700">
            <BsFillTelephoneFill className="mt-1 mr-2" /> (024) 6724037
          </p>
          <p className="flex items-start text-slate-700">
            <MdLocationOn className="mt-1 mr-2" /> Jl. Brigjen S. Sudiarto No. 330 Semarang, Palebon Pedurungan
          </p>
        </div>
      </div>

      <div className="w-full text-center bg-red-600 text-lg font-semibold py-3 text-white shadow-inner">
        &copy; {new Date().getFullYear()} SDN PALEBON 03
        <br />
        All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
