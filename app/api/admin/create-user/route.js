// app/api/admin/create-user/route.js (THIS IS THE CORRECTED FILE)

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server'; // IMPORT THIS FOR APP ROUTER RESPONSES

// Initialize Supabase client with Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Export a named function for the POST method
export async function POST(req) { // In App Router, 'req' is a standard Request object
  console.log('API Route: POST handler executed for /api/admin/create-user.');

  try {
    // Parse the JSON body using req.json() for App Router
    const { name, email, password, role, class_id, photo_url } = await req.json();
    console.log('Request Body Data Received:', { name, email, role, class_id, photo_url: photo_url ? 'URL_PROVIDED' : 'NO_URL' });

    // --- SECURITY IMPORTANT: Admin Verification (YOU MUST IMPLEMENT THIS!) ---
    // Example for App Router. You would get the session/token from headers
    // const authHeader = req.headers.get('authorization');
    // const token = authHeader?.split(' ')[1];
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    // }
    // const { data: { user }, error: authUserError } = await supabaseAdmin.auth.getUser(token);
    // if (authUserError || !user || user.app_metadata?.is_admin !== true) {
    //   return NextResponse.json({ error: 'Forbidden: Not an admin user.' }, { status: 403 });
    // }
    // --- END ADMIN VERIFICATION ---

    // 1. Create user in Supabase Auth
    console.log('Attempting to create user in Auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name, role: role, class_id: class_id },
    });

    if (authError) {
      console.error('Supabase Auth createUser error:', authError);
      if (authError.message.includes('User already registered')) {
          return NextResponse.json({ error: 'Email sudah terdaftar. Gunakan email lain.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    console.log('User created in Auth with ID:', authUser.user.id);

    const newUserId = authUser.user.id;

    // 2. Insert additional details into public.users
    // IMPORTANT NOTE: If you have a PostgreSQL TRIGGER (handle_new_user())
    // that automatically populates public.users when a user is created in auth.users,
    // THEN THIS BLOCK OF CODE IS NOT NEEDED AND CAN BE REMOVED.
    // The trigger will handle the public.users synchronization automatically.
    // If you DO NOT have such a trigger, keep this code.
    console.log('Attempting to insert into public.users...');
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUserId,
        name: name,
        email: email,
        role: role,
        class_id: class_id === '' ? null : class_id,
        photo_url: photo_url,
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      await supabaseAdmin.auth.admin.deleteUser(newUserId); // Rollback
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    console.log('User details inserted into public.users.');

    // Return a NextResponse object
    return NextResponse.json({ message: `${role} berhasil ditambahkan!`, userId: newUserId }, { status: 200 });

  } catch (error) {
    console.error('Caught unexpected error in API route try/catch:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server yang tidak terduga.' }, { status: 500 });
  }
}

// If you want to handle other HTTP methods like GET, DELETE, PUT, etc.,
// you would export them as named functions as well:
// export async function GET(request) { /* ... */ }
// export async function DELETE(request) { /* ... */ }