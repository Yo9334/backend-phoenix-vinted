const express = require("express");
const router = express.Router();
// Import de fileupload qui nous permet de recevoir des formdata
const fileUpload = require("express-fileupload");
// Import de cloudinary
const cloudinary = require("cloudinary").v2;

//import middleware auth
const auth = require("../middlewares/auth");
const convertToBase64 = require("../functions/convertToBase64");

const Offer = require("../models/Offer");

router.post("/publish", auth, fileUpload(), async (req, res) => {
  console.log("==>", "route /offer/publish");
  //console.log(req.body);
  //console.log(req.files);
  const { title, description, price } = req.body;
  const product_details = [];
  const keys = Object.keys(req.body);

  keys.forEach((el) => {
    if (el === "brand") {
      product_details.push({ MARQUE: req.body[el] });
    } else if (el === "size") {
      product_details.push({ TAILLE: req.body[el] });
    } else if (el === "condition") {
      product_details.push({ ÉTAT: req.body[el] });
    } else if (el === "color") {
      product_details.push({ COULEUR: req.body[el] });
    } else if (el === "city") {
      product_details.push({ EMPLACEMENT: req.body[el] });
    } else if (el !== "description" && el !== "title" && el !== "price") {
      product_details.push({ [el]: req.body[el] });
    }
  });

  try {
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: product_details,
      owner: req.user,
    });

    // ...
    if (req.files?.picture) {
      // Je convertie le fichier reçu en base64
      const pictureConverted = convertToBase64(req.files.picture);
      // J'envoie l'image sur cloudinary dans un dossier image-promo-phoenix
      const result = await cloudinary.uploader.upload(pictureConverted, {
        folder: "/vinted/offers/" + newOffer._id,
      });
      newOffer.product_image = result;
    }

    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  console.log("==> route delete /offer");
  const id = req.params.id;
  const tab = ["vinted"];

  res.json("plus tard ...");

  /*
  try {
    // const result = await cloudinary.api.root_folders("vinted/offer");
    // console.log(result, "-->");
    result = await cloudinary.api.delete_folder("vinted/offer/");
    console.log(result, "-->");
    res.json("ok");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  */

  /*
  try {
    const offerTodelete = await Offer.findByIdAndDelete(id);
    if (!offerTodelete) {
      return res
        .status(400)
        .json({ message: "Offer `" + id + "` not exist !" });
    }
    tab.push(offerTodelete.product_image.public_id); //value img for deleting
    tab.push(offerTodelete._id.toString()); //value folder for deleting

    tab.forEach(async (el) => {
      //delete in cloudinary
      console.log("...el to delete : ", el);
      const result = await cloudinary.api.delete_resources(el);
      console.log(result);
    });

    res.json({ message: "Offer `" + id + "` has deleted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }*/
});

module.exports = router;
