const User = require("../models/user-model");
const bcrypt=require("bcryptjs")
const home = async (req, res) => {
  try {
    res.status(200).send("Welcome to our home page");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "email already exists" });

    const userCreated = await User.create({ username, email, phone, password });

    res
      .status(201)
      .json({
        message: "registration Succesful",
        token: await userCreated.generateToken(),
        userId: userCreated._id.toString(),
      });
  } catch (error) {
    next(error);
  }
};

//user login logic
const login= async (req,res)=>{
  try {
    const {email,password}=req.body;
    const userExist=await User.findOne({email});
    if(!userExist){
      return res.status(400).json({message:"Invalid Credentials"});
    }
    const user=await userExist.comparePassword(password);
    if(user){
      res
      .status(201)
      .json({
        message: "Login Succesful",
        token: await userExist.generateToken(),
        userId: userExist._id.toString(),
      });
    }else{
      res.status(401).json({message:"Invalid email or password"});
    }
  } catch (error) {
    res.status(500).json("internal server error")
  }
}
//user logiv to send user data

const user= async (req,res)=>{
  try {
    const userData=req.user;
    //console.log(userData);
    return res.status(200).json({userData})
    
  } catch (error) {
    console.log(`error fromt the user route ${error}`);
    
  }
}
module.exports = { home, register,login,user };
