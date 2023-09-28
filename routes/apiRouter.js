const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { UserModel } = require("../models/userModel")
const { loginMiddleware } = require("../middlewares/login.middleware")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { BlogsModel } = require("../models/blogsModel")

const apiRouter = express.Router()

apiRouter.post("/register",async (req,res)=>{
    const {password,email,avatar,username} = req.body
    try {
        bcrypt.hash(password, 5, async (err, hash) =>{
           if(err){
            res.status(500).send({"error":"internal server error"})
           }else if(hash){
            const newUser = new UserModel({email,"password":hash,username,avatar})
            await newUser.save()
            res.status(200).send({"msg":"user added"})
           }
        });
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})




apiRouter.post("/login",loginMiddleware,async (req,res)=>{
  


    try {
     const token =   jwt.sign({
        userID: req.body.userID,
        username:req.body.username
      }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.status(200).send({"token":token,"username":req.body.username,"id":req.body.userID,"avatar":req.body.avatar})

    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})
    }
})

apiRouter.get("/blogs",authMiddleware,async (req,res)=>{
    const {category,title,sort,order} = req.query
    const pipeline = []
    const matchObject = {}
    if(category){
        matchObject.category= category
    }
    if(title){
        matchObject.title= {$regex:title,$options:"i"}
    }
    pipeline.push({$match:matchObject})
    if(sort){
        pipeline.push({$sort:{date:order==="desc"?-1:1}})
    }
    try {
        const blogs = await BlogsModel.aggregate(pipeline)
        res.status(200).send(blogs)
    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})
    }
})
apiRouter.post("/blogs",authMiddleware,async(req,res)=>{
     const {username,title,content,category,comments,userID,likes} = req.body
     const event = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
    const date = event.toLocaleString('en-GB', { timeZone: 'UTC' }).split(",")[0]

    try {
        const newBlog = new BlogsModel({username,title,content,category,userID,date,comments,likes})
        await newBlog.save()
        res.status(200).send({"msg":"blog added",newBlog})
    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})
    }
})

apiRouter.patch("/blogs/:id",authMiddleware,async (req,res)=>{

    const {id} = req.params
    try {
        const blog = await BlogsModel.findOne({_id:id})
        if(blog.userID===req.body.userID){
            await BlogsModel.findByIdAndUpdate({_id:id},req.body)
            res.status(200).send({"msg":"blog updated"})
        }else{
            res.status(403).send({"error":"you are not authorized"})
        }
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})
apiRouter.put("/blogs/:id",authMiddleware,async (req,res)=>{

    const {id} = req.params
    try {
        const blog = await BlogsModel.findOne({_id:id})
        if(blog.userID===req.body.userID){
            await BlogsModel.findByIdAndUpdate({_id:id},req.body)
            res.status(200).send({"msg":"blog updated"})
        }else{
            res.status(403).send({"error":"you are not authorized"})
        }
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})
apiRouter.delete("/blogs/:id",authMiddleware,async (req,res)=>{

    const {id} = req.params
    try {
        const blog = await BlogsModel.findOne({_id:id})
        if(blog.userID===req.body.userID){
            await BlogsModel.findByIdAndRemove({_id:id})
            res.status(200).send({"msg":"blog deleted"})
        }else{
            res.status(403).send({"error":"you are not authorized"})
        }
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})

apiRouter.patch("/blogs/:id/like",authMiddleware,async (req,res)=>{

    const {id} = req.params
    try {
        const blog = await BlogsModel.findOne({_id:id})
      const newCount = blog.likes+1
      await BlogsModel.findByIdAndUpdate({_id:id},{likes:newCount})
      const updatedBog = await BlogsModel.findOne({_id:id})
      res.status(200).send({"msg":"likes are updated for this blog",updatedBog})
    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})
    }
})

apiRouter.patch("/blogs/:id/comment",authMiddleware,async (req,res)=>{
    const {username,content} = req.body
    const {id} = req.params
    try {
        const blog = await BlogsModel.findOne({_id:id})
      const commentsToUpdate = blog.comments
      commentsToUpdate.push({username,content})
     //console.log(commentsToUpdate)
    await BlogsModel.findByIdAndUpdate({_id:id},{comments:commentsToUpdate})
    const updatedBog = await BlogsModel.findOne({_id:id})
   //console.log(updatedBog)
      res.status(200).send({"msg":"comments are updated for this blog",updatedBog})
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})



module.exports = {apiRouter}