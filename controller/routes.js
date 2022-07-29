const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const user = require('../model/user');
const passport = require('passport');
require('./passportLocal')(passport);
require('./googleAuth')(passport);
// require('../config/connection')

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    }
    else {
        res.redirect('/');
    }
}


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("index", { logged: true });
    } else {
        res.render("index", { logged: false });
    }
})
router.get('/login', (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
})
router.get('/signup', (req, res) => {
    res.render("signup", { csrfToken: req.csrfToken() });
})
router.post('/signup', (req, res) => {
    // get all the values
    const { email, username, password, confirmpassword } = req.body;
    // check if they are empty
    if (!email || !username || !password || !confirmpassword) {
        res.render("signup", { err: "All fields required !", csrfToken: req.csrfToken() });
    }
    else if (password != confirmpassword) {
        res.render("signup", { err: "Passowrds Don't Match !", csrfToken: req.csrfToken() });
    } else {

        //validate email and username and password
        //skipping validation
        //check if a user exist
        user.findOne({ $or: [{ email: email }, { username: username }] }, function (err, data) {
            if (err) throw err;
            if (data) {
                res.render("signup", { err: "User Exist, Try Logging In !", csrfToken: req.csrfToken() });

            }
            else {
                //generate a salt 
                bcryptjs.genSalt(12, (err, slat) => {
                    if (err) throw err;
                    //hash the password
                    bcryptjs.hash(password, slat, (err, hash) => {
                        if (err) throw err;
                        user({
                            username: username,
                            email: email,
                            password: hash,
                            googleId: null,
                            provider: 'email',
                        }).save((err, data) => {
                            if (err) throw err;
                            res.redirect('/login');
                        })
                    })
                })
                // save urser in db
                // login the user
                // redirect if you don't want to login
            }
        })
    }
})

router.post('/login', (req, res, next) => {
    // console.log(req.user);
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/profile',
        failureFlash: true,
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', }), (req, res) => {
    res.redirect('/profile')
})

router.get('/profile', checkAuth, (req, res) => {
    res.render("profile", { username: req.user.username });
})

module.exports = router;