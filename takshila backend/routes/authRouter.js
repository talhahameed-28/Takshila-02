const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer=require("nodemailer")
const {  PutCommand, GetCommand } =require ("@aws-sdk/lib-dynamodb");
const ddbDocClient=require("../awsConnect")
const { check, validationResult } = require("express-validator")

const router = express.Router();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SENDER_ID,     
      pass: process.env.GMAIL_APP_PASS,         
    },
  });

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

// Register route
router.post("/register",[

  async (req, res,next) => {
    const {username,password,email}=req.body
    console.log(req.body)
    try{

        if( !username || !password || !email) return res.json({success:false,message:["Missing details"]})
        const params = {
          TableName: "users",
          Key: {
            email, 
          },
        };
    
        const {Item} = await ddbDocClient.send(new GetCommand(params));
        if(Item) return res.json({success:false , message:["This user already exists"]})  
        next()   
    }catch(err){
      console.log(err)
    }
  }
  ,
  check("username")
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("First Name should be between 2 and 20 characters long")
    .matches(/^[a-zA-Z0-9_]{2,20}$/)
    .withMessage("First Name should contain only alphabets, numbers, or underscores"),


  check("email")
  .isEmail()
  .withMessage("Please enter a valid email")
  .normalizeEmail(),

  check("password")
  .isLength({min: 8})
  .withMessage("Password should be atleast 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password should contain atleast one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password should contain atleast one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password should contain atleast one number")
  .matches(/[!@&_$%#*-]/)
  .withMessage("Password should contain atleast one special character")
  .trim(),

  
  async (req, res) => {
   
    const { username, email, password } = req.body;


    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.json({success:false,message:errors.array().map(error=>error.msg)})       
    }

    const otp = generateOTP();
    const expiresAt = Math.floor((Date.now()/1000) + 5*60); // expires in 5 minutes
  
    try {

      const passwordHash = await bcrypt.hash(password, 10);
        const params = {
        TableName: "users",
        Item: {
          email,   // partition key
          username,
          password:passwordHash,
          isVerified:false,
          otp,
          expiresAt
        },
      };
 
      await ddbDocClient.send(new PutCommand(params));
 
      await transporter.sendMail({
          from: `"OTP System" <${process.env.GMAIL_SENDER_ID}>`,
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
        });
           
        res.json({success:true, message: "OTP sent successfully",email });
      } catch (error) {
        console.error(error);
        res.status(500).json({success:false, message: ["Error sending OTP"] });
      }

}]);

router.post("/verifyOTP", async (req, res) => {
  const {email, otp } = req.body; 
  if (!email || !otp)
    return res.status(400).json({success:false, message: "Email and OTP are required" });

  try {
    const params = {
      TableName: "users",
      Key: {
        email, 
      },
    };

    const {Item} = await ddbDocClient.send(new GetCommand(params));
    console.log(Item)
    if (!Item) return res.status(400).json({success:false, message: "Invalid or expired OTP" });

    if (Item.otp !== otp) return res.status(400).json({ success:false, message: "Invalid OTP" });
    if(Math.floor(Date.now()/1000) >= Item.expiresAt) return res.status(400).json({success:false, message: "Expired OTP" });
    Item.isVerified = true;
    Item.otp = undefined;
    delete Item.expiresAt;
    await ddbDocClient.send(
      new PutCommand({
        TableName: "users",
        Item
      })
    );
    // await user.save() 
    const token=jwt.sign({user:Item},process.env.JWT_SECRET,{expiresIn:"1d"})
      res.cookie("token",token,{
          httpOnly:true,
          secure:process.env.NODE_ENV ==="production",
          sameSite: process.env.NODE_ENV==="production"?"none":"strict",
          maxAge:24*60*60*1000
      })  
    res.json({success:true, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false, message: "Error verifying OTP" });
  }
});



// Login route
router.post("/login", async (req, res) => {
  const{email,password}=req.body
  if(!email || !password) return res.json({success:false,message:"Email and password are required"})
  try{
      const params={
        TableName:"users",
        Key:{
          email,
        }
      }
      const {Item}=await ddbDocClient.send(new GetCommand(params))
      if(!Item) return res.json({success:false,message:"User not found"})
      const passmatch=await bcrypt.compare(password,Item.password)
      if(!passmatch) return res.json({success:false,message:"Incorrect password"})
      const token=jwt.sign({user:Item},process.env.JWT_SECRET,{expiresIn:"1d"})
      res.cookie("token",token,{
          httpOnly:true,
          secure:process.env.NODE_ENV ==="production",
          sameSite: process.env.NODE_ENV==="production"?"none":"strict",
          maxAge:24*60*60*1000
      })  
      return res.json({success:true})
  }catch(e){
      res.json({success:false,message:e.message})
  }
});
 

router.post("/logout",(req,res)=>{
  try{
    res.clearCookie("token",{
        httpOnly:true,
        secure:process.env.NODE_ENV ==="production",
        sameSite: process.env.NODE_ENV==="production"?"none":"strict", 
    })
    return res.json({success:true,message:"User logged out"})
}catch(e){
    res.json({success:false,message:e.message})
}
})



module.exports = router;
