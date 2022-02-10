const validatorjs = require("validator");

const Ajv = require("ajv");

const ajv = new Ajv({
    allErrors: true,
    coerceTypes: true,
    useDefaults: "empty",
});

require("ajv-keywords")(ajv);
require("ajv-formats")(ajv);
require("ajv-errors")(ajv);

ajv.addFormat(
    "date",
    "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])?$"
);

ajv.addKeyword({
    keyword: "replaceSlash",
    modifying: true,
    schema: true,
    validate: (schema, data, parentSchema, dataCtx) => {
        if (schema == true) {
            dataCtx.parentData[dataCtx.parentDataProperty] = data.replaceAll(
                "/",
                "-"
            );
        }
        return true;
    },
});

exports.pizzaFormValidator = (req, res, next) => {
    let schema = {
        type: "object",
        properties: {
            date: {
                type: "string",
                format: "date",
                replaceSlash: true,
                transform: ["trim"],
                errorMessage: {
                    format: "date must be in the correct format",
                },
            },
            size: {
                type: "string",
                enum: ["small", "medium", "large", "extra-large"],
                errorMessage: {
                    enum: "Please choose one of the allowed sizes.",
                },
            },
            gluten_free: {
                type: "boolean",
                default: false,
            },
            toppings: {
                type: "array",
                minItems: 3,
                maxItems: 5,
                items: {
                    type: "string",
                    enum: [
                        "tomato sauce",
                        "cheese",
                        "pepperoni",
                        "green peppers",
                        "pineapple",
                        "mushrooms",
                        "olives",
                    ],
                    errorMessage: {
                        enum: "You must choose toppings from the list.",
                    },
                },
                errorMessage: {
                    minItems: "Please pick 3 to 5 toppings.",
                    maxItems: "Please pick 3 to 5 toppings.",
                    type: "Please submit at least 3 toppings.",
                },
            },
            name: {
                type: "string",
                minLength: 1,
                maxLength: 20,
                transform: ["trim"],
                errorMessage: {
                    minLength: "Name should have at least 1 character.",
                    maxLength: "Your name is too long!",
                },
            },
            email: {
                type: "string",
                pattern:
                    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$",
                maxLength: 40,
                transform: ["trim"],
                errorMessage: {
                    pattern: "You must provide a valid email address.",
                    maxLength: "Your email address is too long.",
                },
            },
            rating: {
                type: "number",
                enum: [1, 2, 3, 4, 5],
                default: 5,
                errorMessage: {
                    enum: "Rate score must be smaller than or equal to 5.",
                },
            },
        },
        required: ["date", "size", "toppings", "name", "email"],
        additionalProperties: true,
        errorMessage: {
            required: {
                date: "Please tell us what day you would like your pizza?",
                size: "Please chose the size.",
                toppings: "You must pick 3 to 5 toppings.",
                name: "You must provide a name!",
                email: "Please provide your email address.",
            },
        },
    };

    const validate = ajv.compile(schema);

    validate(req.body);

    res.locals.errors = validate.errors;

    next();
};

exports.colorFormValidator = (req, res, next) => {
    if (req.query.color && validatorjs.isHexColor(req.query.color)) {
        res.locals.color = req.query.color;
    } else {
        res.locals.color = "#554488";
    }

    next();
};
