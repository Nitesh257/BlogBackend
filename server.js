
const express = require("express");
const app= express();
const cors=require("cors")
const authRoute=require("./router/auth-router");
const contactRoute=require("./router/contact-router");
const serviceRoute=require("./router/service-router")
const connectDb=require("./utils/db");
const errorMiddleware = require("./middlewares/error-middleware");
const postRoute=require("./router/post-router")

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// handling cors policy
const corsOptions={
    origin:"http://localhost:5173",
    methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
    credentials:true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/api/auth",authRoute);
app.use("/api/form",contactRoute);
app.use("/api/data",serviceRoute);
app.use("/api/posts",postRoute);

app.use(errorMiddleware)

const PORT=5000;

connectDb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`server is running on port: ${PORT}`);
        
    });
});
