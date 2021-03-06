var express = require('express');
var app = express();
var dotenv = require('dotenv');
var bodyParser = require('body-parser');

dotenv.load(); //get cofiguration file from .env

app.use(bodyParser.json());

var stripe = require("stripe")(process.env.TEST_STRIPE_SECRET_KEY);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.use(express.static(__dirname));

app.post('/process_payment', function (req, res) {
    var token_id = req.body.token_id;
    var purchase_price = req.body.price;

    //console.log(token.id + "\n" + purchase_price);

    var charge = stripe.charges.create({
        amount: purchase_price, // Amount in cents
        currency: "usd",
        source: token_id,
        description: "Example charge"
    },
    function (err, charge) {
        if (err && err.type === 'StripeCardError') {
            // The card has been declined
            res.json({"status": "failure", "reason": "card was declined"});
        } else {
            console.log(charge);
            res.json({"status": "success"});
        }
    });
})

var appPort = 9010;

app.listen(appPort, function () {
    console.log("Magic on port %d", appPort);
});