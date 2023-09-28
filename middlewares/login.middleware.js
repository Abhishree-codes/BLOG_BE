const { UserModel } = require("../models/userModel")
const bcrypt = require("bcrypt")

const loginMiddleware=async (req,res,next)=>{

    const {email,password} = req.body
    try {
        const isUser = await UserModel.findOne({email})
        if(!isUser){
            res.status(401).send({"error":"user doesn't exist"})
        }else{
// Load hash from your password DB.
bcrypt.compare(password, isUser.password, (err, result) =>{
    // result == true
    if(err){
        res.status(500).send({"error":"internal server error"})
    }else if(!result){
        res.status(401).send({"error":"invalid credentials"})    
    }else if(result){
        req.body.userID = isUser._id
        req.body.username = isUser.username
        req.body.avatar = isUser.avatar
        next()
    }
});
        }
    } catch (error) {
        console.log(error,"error")
        res.status(500).send({"error":"internal server error"})
    }
}

module.exports = {loginMiddleware}