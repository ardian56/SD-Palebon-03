export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get("file");
  
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `news/${Date.now()}-${file.name}`;
  
    const { data, error } = await supabase.storage.from("news-images").upload(fileName, fileBuffer, {
      contentType: file.type,
    });
  
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-images/${fileName}`;
  
    return NextResponse.json({ url: imageUrl });
  }
  