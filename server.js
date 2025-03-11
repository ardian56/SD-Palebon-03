require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const AdminBro = require("admin-bro");
// const AdminBroExpress = require("@admin-bro/express");
// const AdminBroMongoose = require("@admin-bro/mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Debugging: Cek apakah `MONGO_URI` terbaca
console.log("MongoDB URI:", process.env.MONGO_URI);

// Koneksi MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Error:", err));

// Contoh Model MongoDB
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String,
}));

// Setup AdminBro
// AdminBro.registerAdapter(AdminBroMongoose);
// const adminBro = new AdminBro({ databases: [mongoose], rootPath: "/admin" });
// const adminRouter = AdminBroExpress.buildRouter(adminBro);
// app.use(adminBro.options.rootPath, adminRouter);

// API Route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
