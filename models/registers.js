const mongoose = require("mongoose");
const validatoe = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        // minlength:6
    },
    confirmpassword: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})


// generating tokens
employeeSchema.methods.generateAuthToken = async function () {
    try {
        // console.log(this._id);
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KET);
        // console.log(token);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;

    } catch (err) {
        res.send("the error part " + err);
        // console.log("the error part " + err);

    }
}

// converting password into hash 
employeeSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();

})

// now we need to create a collection 

const Register = new mongoose.model("Register-pepole", employeeSchema);

module.exports = Register;