const express=require("express")
const app=express()
require("dotenv").config()
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const cors=require("cors")
const { GetCommand } =require ("@aws-sdk/lib-dynamodb");

const ddbDocClient=require("./awsConnect")
const authRouter=require("./routes/authRouter")

const origin=["http://localhost:5173"]
app.get("/",(req,res)=>{
    res.send("Working")
})

app.use(cors({origin,credentials:true}))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())

app.get("/api/auth/check", async(req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ loggedIn: false ,message:"no token" }); 
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      const params={
        TableName:"users",
        Key:{
          email:decoded.user.email,
        }
      }
      const {Item}=await ddbDocClient.send(new GetCommand(params)) 
      return res.json({ loggedIn: true,Item });
    } catch(err) {
      console.log(err)
      return res.json({ loggedIn: false }); 
    }
  });



app.use(authRouter)
app.listen(process.env.PORT,()=>{
        console.log("server on http://localhost:3000")
    })
