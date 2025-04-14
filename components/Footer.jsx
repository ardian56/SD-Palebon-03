'use client'
import { FaInstagramSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io5";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import Image from 'next/image';

const Footer = () => {
  return (
    <div className="w-full">
      <div className="w-full flex flex-col sm:flex-row justify-between bg-blue-400 px-10 pt-20 pb-10">
        <div className="cont flex flex-col mb-6 sm:mb-0">
          <h3 className="border-b text-xl font-bold mb-2">Tautan</h3>
          <a href="#" className="hover:underline">{"> Kemendikbud"}</a>
          <a href="#" className="hover:underline">{"> Dinas Pendidikan"}</a>
        </div>

        <div className="cont flex flex-col mb-6 sm:mb-0">
          <h3 className="border-b text-xl font-bold mb-2">Ikuti Kami</h3>
          <div className="flex flex-row">
            <a href="#" className="text-4xl mr-3 hover:text-white"><FaInstagramSquare /></a>
            <a href="#" className="text-4xl hover:text-white"><IoLogoYoutube /></a>
          </div>
        </div>

        <div className="cont flex flex-col">
          <h3 className="border-b text-xl font-bold mb-2">Kontak</h3>
          <a href="mailto:sdnpalebontiga@gmail.com" className="flex items-start mb-2 hover:underline">
            <MdEmail className="mt-1 mr-2" /> sdnpalebontiga@gmail.com
          </a>
          <p className="flex items-start mb-2">
            <BsFillTelephoneFill className="mt-1 mr-2" /> (024) 6724037
          </p>
          <p className="flex items-start">
            <MdLocationOn className="mt-1 mr-2" /> Jl. Brigjen S. Sudiarto No. 330 Semarang, Palebon Pedurungan
          </p>
        </div>
      </div>

      <div className="w-full text-center bg-blue-800 text-xl font-bold py-2 text-white">
        SDN PALEBON 03
      </div>
    </div>
  );
};

export default Footer;
