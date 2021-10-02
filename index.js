const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const MongoStore = require('connect-mongo');
require('dotenv').config();
//require('dotenv').config({ path: '/.env' })

const app = express();

const hostname = process.env.MONGO_ATLAS_SRV;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: hostname,
        ttl: 600
    }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 60000
    }
}));


app.engine(
    "hbs", 
    handlebars({
        extname: ".hbs",
        defaultLayout: 'index.hbs',
    })
);


app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.static('public'));


const getSessionName = req => req.session.nombre? req.session.nombre: ''

app.get('/login', (req, res)=>{
    if(req.session.nombre) {
        res.render("welcome", {
            nombre: req.session.nombre
        })
    } else {
        res.sendFile(process.cwd() + '/public/login.html');
    }
})

app.post('/login', (req, res)=>{
    let { nombre } = req.body;
    req.session.nombre = nombre;
    res.redirect('/');
})

app.get('/logout', (req, res)=>{
    let nombre = getSessionName(req);

    if(nombre) {
        req.session.destroy( err => {
            if(!err) {
                res.render("logout", { nombre });
            } else {
                res.redirect('/');
            }
        })
    } else {
        res.redirect('/')
    }
})


app.listen(8080, ()=>{
    console.log('Servidor UP!');
    mongoose.connect(hostname, 
        {
            useNewUrlParser: true, 
            useUnifiedTopology: true
        }
    )
        .then( () => console.log('Base de datos conectada') )
        .catch( (err) => console.log(error) );
})