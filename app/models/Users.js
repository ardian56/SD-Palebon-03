import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  pass: { type: String, required: true, unique: true },
});

export default mongoose.models.User || mongoose.model("user", UserSchema);
