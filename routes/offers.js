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
  filter.product_price = {};
  let sort = {};

  let limit = 5;
  let page = 0;

  try {
    keys.forEach((el) => {
      if (el === "title") {
        filter.product_name = new RegExp(req.query[el], "i");
      } else if (el === "priceMax") {
        if (Number(req.query[el])) {
          // filter.product_price["$gte"] = Number(req.query[el]);
          filter.product_price["$lte"] = Number(req.query[el]);
        }
      } else if (el === "priceMin") {
        if (Number(req.query[el])) {
          // filter.product_price["$lte"] = Number(req.query[el]);
          filter.product_price["$gte"] = Number(req.query[el]);
        }
      } else if (el === "sort" && req.query[el] === "price-desc") {
        sort = { product_price: -1 };
      } else if (el === "sort" && req.query[el] === "price-asc") {
        sort = { product_price: 1 };
      } else if (el === "page") {
        page = Number(req.query[el]) ? Number(req.query[el]) : 0;
        // console.log(typeof page);
      }
    });

    console.log(filter, "sort : ", sort, "page : ", page);

    if (page > 0) {
      offersToFind = await Offer.find(filter)
        .select("product_name product_price -_id")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      offersToFind = await Offer.find(filter)
        .select("product_name product_price -_id")
        .sort(sort);
      //.skip(page);
    }

    res.json({ count: offersToFind.length, offers: offersToFind });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
