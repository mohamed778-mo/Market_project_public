const express = require('express');
const cors = require('cors');
const connection = require("./config/connection");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const bodyParser = require("body-parser");


const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const user = require('./routers/user_router')
const admin = require('./routers/admin_router')
const payment = require('./routers/payment_router')

const app = express();
app.use(express.json());

app.use(cors())
app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use('/app/user',user)
app.use('/app/admin',admin)
app.use('/app/payments', payment);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

connection();

const port = process.env.PORT || 3002 ;
app.listen(port, () => {
    console.log(`Connection on port ${port}`);
});
