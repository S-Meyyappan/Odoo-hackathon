import mongoose from "mongoose";

const TaskSchema=new mongoose.Schema({
    'taskName':{type:String,required:true},
    'taskAssignee':{type:String,required:true},
    'projectName':{type:String,required:true},
    'taskTags':{type:[String],required:true},
    'deadline':{type:Date,required:true},
    'image':{type:String,required:true},
    'description':{type:String,required:true}
})

const task=mongoose.model("task",TaskSchema)

export default task