import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import connectDb from "./db.js"
import User from "./models/userSchema.js"
import task from "./models/taskSchema.js";
import projects from "./models/projectSchema.js";


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

//adding task
app.post("/addtasks", async(req,res)=>{
  try{
    const taskData=new task({
      taskName:req.body.taskName,
      taskAssignee:req.body.taskAssignee,
      projectName:req.body.projectName,
      taskTags:req.body.taskTags,
      deadline:req.body.deadline,
      image:req.body.image,
      description:req.body.description
    })
    await taskData.save()
    console.log("Task added");
  }
  catch(err){
    return res.status(500).json({message:"Unable to add task",error:err});
    }
});

//getting tasks
app.get("/gettasks",async(req,res)=>{
    try{
      const getdata=await task.find();
      res.json(getdata);
      console.log("Tasks fetched");
    }
    catch(err){
      return res.status(500).json({message:"Unable to fetch tasks",error:err});
    }
});

//update tasks
app.put("/updatetasks/:id",async(req,res)=>{
  try{
    const id=req.params.id;
    const updatedDate= await task.findByIdAndUpdate(id)
    res.json(updatedDate)
    console.log("Task updated");
  }
  catch(err){
    return res.status(500).json({message:"Unable to update task",error:err});
  }
})

//delete tasks
app.delete("/deletetasks/:id",async(req,res)=>{
  try{
    const id=req.params.id;
    const deletedData=await task.findByIdAndDelete(id)
    if(!deletedData)
    {
      return res.status(404).json({message:"Task not found"});
    }
    res.json({message:"Task deleted successfully"});
    console.log("Task deleted");
  }
  catch(err)
  {
    return res.status(500).json({message:"unable to delete task",error:err});
  }
})

//adding projects
app.post("/addprojects", async(req,res)=>{
  try{
    const proData=new projects({
      projectName:req.body.projectName,
      projectManager:req.body.projectManager,
      teamMembers:req.body.teamMembers,
      projectTags:req.body.projectTags,
      deadline:req.body.deadline,
      image:req.body.image,
      description:req.body.description,
      tasks:req.body.tasks
    })
    await proData.save()
    console.log("Project added");
  }
  catch(err){
    return res.status(500).json({message:"Unable to add project",error:err});
  }
});

//getting projects
app.get("/getprojects",async(req,res)=>{
  try{
    const getData =await projects.find();
    res.json(getData);
    console.log("Projects fetched");
  }
  catch(err){
    return res.status(500).json({message:"Unable to fetch projects",error:err});
  }

});

//update projects
app.put("/updateprojects/:id",async(req,res)=>{
  try{
    const id =req.params.id;
    const updatedData=await projects.findByIdAndUpdate(id);
    res.json(updatedData);
    console.log("Project updated");
    }
    catch(err){
      return res.status(500).json({message:"Unable to update project",error:err});
    }
});

//delete projects
app.delete("/deleteprojects/:id",async(req,res)=>{
  try{
    const id=req.params.id;
    const deletedData=await projects.findByIdAndDelete(id);
    if(!deletedData)
    {
      return res.status(404).json({message:"projects not found"});
    }
  }
  catch(err)
  {
    return res.status(500).json({message:"unable to delete project",error:err});
  }
})

//server start
app.listen(process.env.port || 5000,()=>{
    console.log("Server started")
})