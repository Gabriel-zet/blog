const express = require("express")
const router = express.Router()
const User = require("./Users")
const bcrypt = require("bcryptjs")
const Category = require('../categories/Category')
const Article = require("../articles/Article")
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/users", adminAuth,(req,res) => {
    User.findAll().then(users => {
        res.render("admin/users/index", {users: users})
    })
})

router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create")
})

router.post("/users/create", (req,res) => {
    var email = req.body.email;
    var password = req.body.password;


    User.findOne({where:{email: email}}).then( user => {
        if(user == undefined){

            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(password, salt);
    
            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/admin/users")
            }).catch((err) => {
                res.redirect("/admin/users")
         })

        }else{
            res.redirect("/admin/users/create")
        }
    })
    
})

/*router.post("/admin/users/edit", (req, res) => {
    res.render("admin/users/edit")
})

router.post("/admin/users/edit/:id", (req, res) => {
    var id = req.params.id
    User.findByPk(id).then(user => {
        if(user != undefined){
            res.render("admin/users/edit", {user: user})
        }else{
            res.redirect("/admin/users")
        }
    }).catch(err => {
        res.redirect("/admin/users")
    })
})

router.post("/users/update", (req, res) => {
    var id = req.body.id
    var email = req.body.email

    User.update({email: email},{
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/users")
    })
}) */

router.post("/users/delete", adminAuth,(req,res) => {
    var id = req.body.iddel
    if(id != undefined){
        if(!isNaN(id)){
            User.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/users")
            })
        }else{
            res.redirect("/admin/users")
        }
    }else{
        res.redirect("/admin/users")
    }
})

router.get("/login", (req, res) => {
    res.render("admin/users/login")
})

router.post("/authenticate", (req, res) => {
    var email = req.body.email
    var password = req.body.password

    User.findOne({where: {email: email}}).then(user => {
        if(user != undefined){ // Se exisste um user com esse email
            // validar senha
            var correct = bcrypt.compareSync(password, user.password) // vai tranformar a senha escrita em hash e comparar com a senha no db
        
            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/")
            }else{
                res.redirect("/login")
            }

        }else{
            res.redirect("/login")
        }
    })
})

router.get("/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

module.exports = router