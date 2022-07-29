const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session')

const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const path = require('path');
const csrf = require('csurf');
var MemoryStore = require('memorystore')(expressSession);
const passport = require('passport');
const flash = require('connect-flash');

// require('./config/connection')
const user = require('./model/user');

const app = express();

app.set('view engin', 'ejs');
app.set('views', __dirname + './views',);
app.use(express.json());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userForm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: true,
    // useCreateIndex: false,
}).then(() => {
    console.log("connection successful");
}).catch((error) => {
    console.log("no connection" + error);
})

const static_path = path.join(__dirname, "./public");
const template_path = path.join(__dirname, './template/views');
const partials_path = path.join(__dirname, "./template/partials");
const cookiePasrer = require('cookie-parser');

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(cookiePasrer('random'));

app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    maxAge: 60 * 1000,
    store: new MemoryStore({
        checkPeriod: 8640000
    })
}))
app.use(csrf());
app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});

app.use(require('./controller/routes.js'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log("server is starte at " + PORT);
})