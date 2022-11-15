const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  console.log("==>", "route /payment");

  try {
    console.log(req.body);

    // const stripeToken = req.body.stripeToken;
    const { token, title, amount } = req.body;

    if (!token || !title || !amount) {
      return res
        .status(404)
        .json({ message: "Missing data: token, title and amount." });
    }

    const response = await stripe.charges.create({
      amount: amount,
      currency: "eur",
      description: title,
      source: token, //stripeToken,
    });

    console.log("==> stripe status: ", response.status);
    // Je peux supprimer l'offre
    res.json({ status: response.status });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
