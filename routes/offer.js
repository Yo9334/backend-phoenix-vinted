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
const { findById } = require("../models/Offer");

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

    if (req.files?.picture) {
      // Je convertie le fichier reçu en base64
      const pictureConverted = convertToBase64(req.files.picture);
      // J'envoie l'image sur cloudinary dans un dossier image-promo-phoenix
      const result = await cloudinary.uploader.upload(pictureConverted, {
        folder: "/vinted/offers/" + newOffer.owner._id,
      });
      newOffer.product_image = result;
    }

    await newOffer.save();
    // console.log(newOffer);
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//delete offer
router.delete("/:id", auth, fileUpload(), async (req, res) => {
  console.log("==> route delete /offer");
  const id = req.params.id;
  const tab = [];

  try {
    const offerToDelete = await Offer.findByIdAndDelete(id);
    if (!offerToDelete) {
      return res.status(400).json({ message: "Offer `" + id + "` not exist." });
    }
    tab.push(offerToDelete.product_image.public_id); //value image for deleting

    //delete in cloudinary
    tab.forEach(async (el) => {
      await cloudinary.api.delete_resources(el);
      //const result = await cloudinary.api.delete_resources(el);
      //console.log(result);
    });

    res.json({ message: "Offer `" + id + "` has deleted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//get offer details
router.get("/:id", async (req, res) => {
  console.log("==>", "route get /offer/:id");
  try {
    const id = req.params.id;
    const offerToFind = await Offer.findById(id).populate("owner", "account");
    if (!offerToFind) {
      return res.status(400).json({ message: "Offer `" + id + "` not exist." });
    }
    res.json(offerToFind);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//update offer data
router.put("/", fileUpload(), async (req, res) => {
  console.log("==>", "route put /offer");
  console.log(req.body);

  const update = {};
  let product_details = null;
  let insert_details = false;

  const { id, title, description, price, condition, city, brand, color, size } =
    req.body;

  const offerToFind = await Offer.findById(id);
  if (offerToFind == null) {
    return res.status(400).json({ message: "Offer `" + id + "` not exist." });
  }
  if (title) update.product_name = title;
  if (description) update.product_description = description;
  if (price) update.product_price = price;

  if (offerToFind.product_details.length === 0) {
    product_details = [];
    insert_details = true;
  }

  /*
  if (brand) {
    if (insert_details === true) product_details.push({ MARQUE: brand });
    product_details  { $set: { "product_details.$.MARQUE": brand } };
  }
  
  if (size) {
    insert_details === true
      ? product_details.push({ TAILLE: size })
      : (update.product_details.TAILLE = size);
  }
  
  if (condition) {
    insert_details === true
      ? product_details.push({ ÉTAT: condition })
      : (update.product_details.ÉTAT = condition);
  }
  
  if (color) {
    insert_details === true
      ? product_details.push({ COULEUR: color })
      : (update.product_details.COULEUR = color);
  }

  if (city) {
    insert_details === true
      ? product_details.push({ EMPLACEMENT: city })
      : (update.product_details.EMPLACEMENT = city);
  }

  if (insert_details === true) update.product_details = product_details;

  console.log(offerToFind, "---", update, "----", insert_details);
  const offerToUpdate = await Offer.findByIdAndUpdate(id, update);
  res.json(offerToUpdate);
  */

  res.json("ok");
});

module.exports = router;
