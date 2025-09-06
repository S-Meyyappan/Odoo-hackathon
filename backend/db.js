import mongoose from "mongoose";

const connection=async ()=>{
    try{
        await mongoose.connect(process.env.MONGOURI)
        console.log("Mongodb connected successfully");
    }
    catch(err)
    {
        console.log("unable to connect",err)
        process.exit(1)
    }
}
export default connection