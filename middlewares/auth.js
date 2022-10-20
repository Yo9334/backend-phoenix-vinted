const User = require("../models/User");

const auth = async (req, res, next) => {
  console.log("==>", "middlewares auth");
  // console.log("req.headers : ", req.headers);
  const token = req.headers.authorization.replace("Bearer ", "");
  console.log("token : ", token);

  try {
    //1er Methode
    // const userToFind = await User.findOne({ token: token }).select(
    //   "-hash -salt"
    // );

    //2eme Methode
    const userToFind = await User.findOne({ token: token }).select("account");

    if (userToFind === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //usertoFind in to Object `req`
    req.user = userToFind;
    next();
  } catch (error) {
    // avoir dans le temps : return
    res.status(400).json({ error: error.message });
  }
};

module.exports = auth;
