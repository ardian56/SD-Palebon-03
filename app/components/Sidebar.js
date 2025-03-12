"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-red-900 text-white p-5">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <ul className="mt-4">
        <li className="py-2 px-3 hover:bg-blue-700 rounded">
          <Link href="/admin">Dashboard</Link>
        </li>
        <li className="py-2 px-3 hover:bg-blue-700 rounded">
          <Link href="/">Settings</Link>
        </li>
      </ul>
    </div>
  );
}
