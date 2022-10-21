const express = require("express");
const mongoose = require("mongoose");
// Import de cloudinary
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const offersRoutes = require("./routes/offers");

// Je me connecte à mon compte cloudinary avec mes identifiants présents sur mon compte
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/*app.get("/", (req, res) => {
  res.send("Api Vinted started");
});*/
app.use("/user", userRoutes);
app.use("/offer", offerRoutes);
app.use("/offers", offersRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route not exist." });
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started on ${process.env.PORT}`);
});
