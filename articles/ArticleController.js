const express = require('express')
const router = express.Router()
const Category = require('../categories/Category')
const Article = require('./Article')
const slugify = require('slugify')
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/articles", adminAuth, (req,res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles})
    })
})

router.get("/admin/articles/new", adminAuth, (req,res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories})
    })
})

router.post("/articles/save", adminAuth, (req,res) => {
   var title = req.body.tittle;
   var body = req.body.body;
   var category = req.body.category;

    Article.create({
        tittle: title,
        slug: slugify(title),
        body: body,
        categoriaId: category
    }).then(() => {
        res.redirect("/admin/articles")
    })
   
})


router.post("/articles/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var tittle = req.body.tittle;
    var body = req.body.body;
    var category = req.body.category

    Article.update({tittle: tittle, body: body, categoryId: category, slug: slugify(tittle)},{
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(err => {
        res.redirect("/");
    });
});


router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    Article.findByPk(id).then(article => { // pesquisa o artigo pelo id dele
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {categories: categories, article: article})
            })


        }else{
            res.redirect("/admin/articles")
        }
    }).catch(err => {
        res.redirect("/admin/articles")
    })
})

router.post("/articles/delete", adminAuth, (req, res) => {
    var id = req.body.iddel;
    if(id != undefined){
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            });
        }else{// NÃO FOR UM NÚMERO
            res.redirect("/admin/articles");
        }
    }else{ // NULL
        res.redirect("/admin/articles");
    }
});

router.get("/articles/page/:num",(req, res) => {
    var page = req.params.num
    
    if(isNaN(page || page == 1 )){
        offset = 0
    }else {
        offset = (parseInt(page) - 1) * 4;
    }

//Pesquisa todos os elementos do banco de dado, e a quantidade de itens, igual ao find all que retorna todos os elementos, mas aqui também é retornada uma contagem
    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order:[[
            'id',
            'DESC'
        ]],
    }).then(articles => {

        var next
        if(offset + 4 >= articles.count){
            next = false
        } else {
            next = true
        }


        var result = {
            page: parseInt(page),
            next : next,
            articles : articles
        }

        Category.findAll().then(categories =>{
            res.render("admin/articles/page", {result: result, categories: categories})
        })
    })


})

module.exports = router