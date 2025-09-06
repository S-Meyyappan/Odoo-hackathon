import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectManager: { type: String, required: true },
  projectTags: { type: [String] },
  deadline: { type: Date, required: true },
  priority: { type: String },
  image: { type: String },
  description: { type: String },
});

const Project = mongoose.model("project", ProjectSchema);
export default Project;
