const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

router.get("/", async (req, res) => {
  console.log("==>", "route get /offers");
  console.log("query :", req.query);

  const keys = Object.keys(req.query);
  console.log("Keys : ", keys);

  let offersToFind = [];
  const filter = {};
  let sort = {};

  let limit = 500;
  let page = 0;

  try {
    keys.forEach((el) => {
      if (el === "title") {
        filter.product_name = new RegExp(req.query[el], "i");
      } else if (el === "priceMax") {
        if (Number(req.query[el])) {
          // filter.product_price["$lte"] = Number(req.query[el]);
          filter.product_price = { $lte: Number(req.query[el]) };
        }
      } else if (el === "priceMin") {
        if (Number(req.query[el])) {
          // filter.product_price["$gte"] = Number(req.query[el]);
          filter.product_price = { $gte: Number(req.query[el]) };
        }
      } else if (el === "sort" && req.query[el] === "price-desc") {
        sort = { product_price: -1 };
      } else if (el === "sort" && req.query[el] === "price-asc") {
        sort = { product_price: 1 };
      } else if (el === "page") {
        page = Number(req.query[el]) ? Number(req.query[el]) : 0;
      }
    });

    if (req.query.priceMin && req.query.priceMax) {
      filter.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }

    // console.log(filter);

    offersToFind = await Offer.find(filter)
      .select("product_name product_price owner product_image")
      .populate("owner", "account") //("owner", "account _id")
      .skip(page !== 0 ? (page - 1) * limit : 0)
      .sort(sort)
      .limit(limit);

    const countOffers = await Offer.countDocuments(filter);
    // console.log(offersToFind);
    res.json({ count: countOffers, offers: offersToFind });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
