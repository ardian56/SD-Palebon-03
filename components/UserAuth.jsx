// components/UserAuth.jsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// UBAH IMPORT INI
import { createClient } from './lib/supabaseClient'; // PATH DISESUAIKAN

export default function UserAuth({ initialUser, initialUserData }) {

  const supabase = createClient();

}