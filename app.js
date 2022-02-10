let express = require("express");
let app = express();

const validator = require("./validator");
validator.pizzaFormValidator;
validator.colorFormValidator;

const { pizzaFormValidator } = require("./validator");
const { colorFormValidator } = require("./validator");

const server = app.listen(8080, () => console.log("listening"));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.get("/", colorFormValidator, (req, res) => {
    let color = res.locals.color;
    if (color != null) {
        res.render("index", { data: color });
    } else {
        res.render("index", { data: "" });
        console.log("1111");
    }
});

app.use(express.urlencoded({ extended: true }));

app.post("/orders", pizzaFormValidator, (req, res) => {
    if (res.locals.errors !== null) {
        res.status(422).render("error", {
            validationErrors: res.locals.errors,
        });
    } else {
        res.render("success", { pizza: req.body });
    }
});
