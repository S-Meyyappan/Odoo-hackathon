import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import connectDb from "./db.js"
import User from "./models/userSchema.js"


dotenv.config()

const app=express()
await connectDb()

//middleware
app.use(cors())
app.use(express.json({limit:"10mb"}))

//api calls
app.post("/register",async (req,res)=>{
    try{
      const{username,email,password}=req.body;

      const existingUser=await User.findOne({email})
      if(existingUser){
        return res.status(400).json({message:"User already registered"})
      }
      
      const salt=await bcrypt.genSalt(10)
      const hashedpassword=await bcrypt.hash(password,salt)

      const userSubmission=new User({username,email,password:hashedpassword})
      await userSubmission.save()

      const token=jwt.sign(
        {id:userSubmission._id,email:userSubmission.email},
        process.env.JWT_SECRET,
        {expiresIn:"12h"}
      )

      res.json(token)
    }
    catch(err){
      console.error(err)
      return res.status(500).json({message:"Unable to register user",error:err})
    }
})

app.post("/login",async(req,res)=>{
  try{
    const{email,password}=req.body

    const userFind=await User.findOne({email})
    if(!userFind)
    {
      return res.status(400).json({message:"Invalid EmailID"})
    }

    const passMatch=await bcrypt.compare(password,userFind.password)
    if(!passMatch)
    {
      return res.status(400).json({message:"Incorrect Password"})
    }

    const token=jwt.sign(
      {id:userFind._id,email:userFind.email},
      process.env.JWT_SECRET,
      {expiresIn:"12h"}
    )

    res.json(token)
  }
  catch(err){
      return res.status(500).json({message:"Unable to login",error:err})
  }
})

app.get("/",(req,res)=>{
    res.send("Hello !")
})

//server start
app.listen(process.env.port || 5000,()=>{
    console.log("Server started")
})