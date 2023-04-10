const express = require('express')
const router = express.Router()
const Category = require('../categories/Category')
const Article = require('./Article')
const slugify = require('slugify')

router.get("/admin/articles", (req,res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles})
    })
})

router.get("/admin/articles/new",(req,res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories})
    })
})

router.post("/articles/save", (req,res) => {
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

router.post("/articles/delete", (req, res) => {
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
        

module.exports = router