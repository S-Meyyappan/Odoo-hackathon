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

// Get users by role (employee or manager)
app.get("/users", async (req, res) => {
  try {
    const role = req.query.role; // ?role=employee or ?role=manager

    if (!role || !["employee", "manager"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid or missing role query parameter" });
    }

    const users = await User.find({ role: role.toLowerCase() }).select("username"); 
    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch users", error: err });
  }
});

// add task
app.post("/tasks", async (req, res) => {
  try {
    const project = await projects.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const taskData = new task({
      taskName: req.body.taskName,
      taskAssignee: req.body.taskAssignee,
      projectId: req.body.projectId,  // link to project
      taskTags: req.body.taskTags,
      deadline: req.body.deadline,
      image: req.body.image,
      description: req.body.description,
    });

    await taskData.save();
    res.json(taskData);
    console.log("Task added");
  } catch (err) {
    return res.status(500).json({ message: "Unable to add task", error: err });
  }
});

// get tasks for a specific project
app.get("/projects/:id/tasks", async (req, res) => {
  try {
    const projectId = req.params.id;
    const tasksList = await task.find({ projectId });
    res.json(tasksList);
  } catch (err) {
    return res.status(500).json({ message: "Unable to fetch tasks", error: err });
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
    res.status(201).json(proData);
    console.log("Project added");
  }
  catch(err){
    console.error(err);
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