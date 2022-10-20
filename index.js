const express = require("express");
const mongoose = require("mongoose");
// Import de cloudinary
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost/j4-vinted-db");
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const offersRoutes = require("./routes/offers");

// Je me connecte à mon compte cloudinary avec mes identifiants présents sur mon compte
cloudinary.config({
  cloud_name: "dygi97zuu",
  api_key: "517192878271516",
  api_secret: "u_dFn16YFL_o-gwBdhYgxIF_V40",
  secure: true, // <- recommandation
});

app.get("/", (req, res) => {
  res.send("Api Vinted started");
});
app.use("/user", userRoutes);
app.use("/offer", offerRoutes);
app.use("/offers", offersRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route not exist." });
});

app.listen(3000, () => {
  console.log("Server Started");
});
