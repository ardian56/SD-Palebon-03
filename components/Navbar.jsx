'use client'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <nav className="bg-blue-500 fixed w-full top-0 z-50 shadow-xl">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/assets/logo2.png" width={32} height={32} className="h-8 w-8 rounded-full" alt="Logo SD Palebon 03" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">SD Palebon 03</span>
        </Link>

        <button
          data-collapse-toggle="navbar-multi-level"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-controls="navbar-multi-level"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>

        <div className="hidden w-full md:block md:w-auto" id="navbar-multi-level">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-blue-400 rounded-lg bg-blue-500 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
            <li>
              <Link href="/" className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-white md:p-0">
                Beranda
              </Link>
            </li>
            <li>
              <button
                id="dropdownNavbarLink"
                data-dropdown-toggle="dropdownNavbar"
                className="flex items-center justify-between w-full py-2 px-3 text-white hover:bg-blue-600 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 md:w-auto"
              >
                Profile
                <svg className="w-2.5 h-2.5 ms-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>
              <div id="dropdownNavbar" className="z-10 hidden font-normal bg-blue-500 divide-y divide-blue-400 rounded-lg shadow-sm w-44">
                <ul className="py-2 text-sm text-white" aria-labelledby="dropdownLargeButton">
                  <li>
                    <Link href="/profil" className="block px-4 py-2 hover:bg-blue-600">
                      Profile Sekolah
                    </Link>
                  </li>
                  <li>
                    <button
                      id="doubleDropdownButton"
                      data-dropdown-toggle="doubleDropdown"
                      data-dropdown-placement="right-start"
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-blue-600"
                    >
                      Dropdown
                      <svg className="w-2.5 h-2.5 ms-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                      </svg>
                    </button>
                    <div id="doubleDropdown" className="z-10 hidden bg-blue-500 divide-y divide-blue-400 rounded-lg shadow-sm w-44">
                      <ul className="py-2 text-sm text-white" aria-labelledby="doubleDropdownButton">
                        <li><a href="#" className="block px-4 py-2 hover:bg-blue-600">Overview</a></li>
                        <li><a href="#" className="block px-4 py-2 hover:bg-blue-600">My downloads</a></li>
                        <li><a href="#" className="block px-4 py-2 hover:bg-blue-600">Billing</a></li>
                        <li><a href="#" className="block px-4 py-2 hover:bg-blue-600">Rewards</a></li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-blue-600">Earnings</a>
                  </li>
                </ul>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-blue-600">Sign out</a>
                </div>
              </div>
            </li>
            <li>
              <a href="#" className="block py-2 px-3 text-white rounded-sm hover:bg-blue-600 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-3 text-white rounded-sm hover:bg-blue-600 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0">
                Pricing
              </a>
            </li>
            <li>
              <Link href="/kontak" className="block py-2 px-3 text-white rounded-sm hover:bg-blue-600 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
