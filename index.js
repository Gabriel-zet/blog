const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const connection = require('./database/database')

// Controllers
const categoriesController = require('./categories/CategoryController')
const articleController = require('./articles/ArticleController')
const usersController = require('./users/UsersController')

// Models
const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require ('./users/Users')
// View engine
app.set("view engine", "ejs")


// Sessions
app.use(session({
    secret: "qlqcoisa", cookie: {maxAge: 30000000} // tempo de expiração do cookie em miliseg
}))

// Static
app.use(express.static('public'))

// Body-Parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Database
connection
        .authenticate()
        .then(() => {
            console.log("Autenticação completa")
        }).catch((error) => {
            console.log('erro no database', error)
        })

app.use("/", categoriesController)
app.use("/", articleController)
app.use("/", usersController)


/*app.get("/session", (req, res) => {
    req.session.treinamento = "Formação node"
    req.session.ano = "2023"
    req.session.user = {
        username: "Zet",
        email: "email@email.com",
        id: 1
    }
    res.send("Sessão gerada!")
})

app.get("/leitura", (req, res) => {
    res.json({
        treinamento: req.session.treinamento, 
        ano: req.session.ano,
        user: req.session.user
    })
}) */


app.get("/", (req, res) =>{
    Article.findAll({
        order:[[
            'id',
            'DESC'
        ]], 
        limit: 4
    }).then(articles => {

        Category.findAll().then(categories => {
            res.render("index", {articles: articles, categories: categories})
        })
    })

})

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
            res.render("article", {article: article, categories: categories})
        }) } else {
            res.redirect('/')
        }
        }).catch(error => {
            console.log("Ocorreu um erro ao renderizar o artigo!")
            res.redirect('/')
    })
})



app.get("/category/:slug",(req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then( category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("index",{articles: category.articles, categories: categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch( err => {
        res.redirect("/");
    })
})


app.listen(8080,  () => {
    console.log("O servidor  está ativo")
})