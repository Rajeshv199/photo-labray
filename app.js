require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
var flash = require('connect-flash');
require('dotenv/config');
require("./db/connection");
const imgModel = require('./models/img');
const Register = require("./models/registers");


var app = express();
const port = process.env.PORT || '4000';

// set up multer for storing uploaded files
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const static_path = path.join(__dirname, "./public");
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(static_path));
app.set("view engine", "ejs");





var upload = multer({ storage: storage });

// the GET request handler that provides the HTML UI

app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('index', { items: items });
        }
    });
});

// the POST handler for processing the uploaded file

app.post('/', upload.single('image'), (req, res, next) => {

 
    var obj = {      
        name: req.body.name.toLowerCase(),
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {

            res.redirect('/');
        }
    });
});

var keyword;
app.post('/search', function(req, res) {

    console.log(req.body.keyword);

    keyword = req.body.keyword.toLowerCase();;
    res.redirect('/search');
  });

app.get('/search', (req, res) => {

    imgModel.find({name:keyword}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('search',{ items: items });
        }

    });
});

app.get("/explore", (req, res) => {
    res.render("explore");
});


// register page ------------------

app.get("/register", (req, res) => {
    res.render("register");
});

// create a new user in our database 
app.post("/register", async (req, res) => {

    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmp = new Register({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                gender: req.body.gender
                
            })

            const token = await registerEmp.generateAuthToken();
            console.log(token);
            res.cookie("jwt", token);
        
            const registered = await registerEmp.save();

            // res.status(400).render("/login");
            res.status(201).redirect("/login");

        } else {
            res.send("Password Not Matching Please try again...");
        }
    } catch (err) {
        res.status(400).send(err);
    }

});

// end 

// login page ------------------
app.get("/login", (req, res) => {
    res.render("login");
});

// login check 
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // get data from database
        const useremail = await Register.findOne({ email: email });
        const matchpassword = await bcrypt.compare(password, useremail.password)

        const token = await useremail.generateAuthToken();

        // automatic expires-------  
        res.cookie("jwt", token, {
            // expires: new Date(Date.now() + 600000),
            httpOnly: true,
            // secure: true
        })

        if (matchpassword) {
            res.status(201).redirect("/");
            
        } else {
            // alert("Invalid login Details");
            
            res.render("login");


        }

    } catch (err) {
        res.status(400).send("Invalid login Details");
    }

});

// end 

app.get("/forgetpass", (req, res) => {
    res.render("forgetpass");

});

app.get("/uploadimg", auth, (req, res) => {
    res.render("uploadimg");

});

app.get("/imgshow", (req, res) => {
    res.render("imgshow");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.use(flash());
app.get("/logout", auth, async (req, res) => {
    try {
        // console.log(req.user);

        // // for single logout
        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token === req.token
        });

        // logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
       

        await req.user.save();
        res.redirect("/");

    } catch (error) {
        res.status(500).send(error);
    }

});


app.get("*", (req, res) => {
    res.render("404error", {
        errorMsg: "Opps! Page Not Found"
    });
});


// app.post('/search', async (req, res)=> {

//     const name = req.body.srech;
//     console.log(req.body.srech);

//     const findd = await imgModel.find({name:name});

//     res.json(findd);

//     // console.log(findd);
   

// });







app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})