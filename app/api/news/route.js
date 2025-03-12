import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}


export async function POST(req) {
    const { Judul, Isi, gambar } = await req.json();
  
    const { data, error } = await supabase.from("news").insert([{ Judul, Isi, gambar }]);
  
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
    return NextResponse.json(data);
  }

  
  export async function DELETE(req) {
    const { id } = await req.json();
  
    const { error } = await supabase.from("news").delete().match({ id });
  
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
    return NextResponse.json({ message: "Berita berhasil dihapus" });
  }
  