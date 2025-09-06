import mongoose from "mongoose";
import task from "./taskSchema";

const ProjectSchema=new mongoose.Schema({
    'projectName':{type:String,required:true},
    'projectTags':{type:[String],required:true},
    'projectManager':{type:String,required:true},
    'deadline':{type:Date,required:true},
    'priority':{type:String,required:true},
    'image':{type:String,required:true},
    'description':{type:String,required:true},
    'tasks':{type:[task],required:true}
})

const project=mongoose.model("project",ProjectSchema)

export default project