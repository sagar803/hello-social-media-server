import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    //grabbing the token send by request header 
    let token = req.header("Authorization");
    //if token does not exist
    if (!token) {
      return res.status(403).send("Access Denied");
    }    
    //we need to make sure the token recieved starts with Bearer and trim accordingly
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
