const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Library-test").then(()=>{
    console.log("connection successful.");
}).catch((err)=>{
    console.log("no connection");
})



