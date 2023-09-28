const jwt = require("jsonwebtoken")
require("dotenv").config()


const authMiddleware= async (req,res,next)=>{
    const token = req?.headers?.authorization?.split(" ")[1]
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>{
           if(err){
            console.log(err)
            res.status(500).send({"error":"internal server error"})
           }else if(!decoded){
            res.status(401).send({"error":"invalid token"})
           }else{
            req.body.userID = decoded.userID
            next()
           }
          });
          
    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})
    }
}
module.exports = {authMiddleware}