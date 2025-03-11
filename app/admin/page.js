"use client";

import Sidebar from "../components/Sidebar";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </main>
    </div>
  );
}
