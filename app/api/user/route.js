import { connectDB } from "@/lib/supabase";
import User from "@/models/Users";

export async function GET() {
  await connectDB();

  try {
    const users = await User.find();
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}
