const express = require('express');
const cors = require('cors');
const connection = require("./config/connection");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
const express_mongo_sanitize= require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp = require('hpp')
const helmet = require('helmet');
const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const user = require('./routers/user_router')
const admin = require('./routers/admin_router')
const payment = require('./routers/payment_router')

const app = express();


app.use(cors())

const LIMIT = '500kb';
app.use(bodyParser.json({ limit: LIMIT, extended: true }));
app.use(bodyParser.urlencoded({ limit: LIMIT, extended: true }));
app.use(express.json({ limit: LIMIT }));

app.use(cookieParser());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

const ratelimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    message: "Too many requests from this IP, please try again later.",
});

 app.use(ratelimiter); 

 app.use(helmet());
 app.use(hpp())
 app.use(express_mongo_sanitize())
 app.use(xss())


app.use('/app/user',user)
app.use('/app/admin',admin)
app.use('/app/payments', payment);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// if route not exist in app
app.all('*', (req, res, next) => {
  const error = new Error(`Can't find this route ${req.originalUrl}`);
  next(error); 
});

// error express handling
app.use((err, req, res, next) => {
  res.status(400).json({
    success: false,
    message: err.message 
  });
});

connection();

const port = process.env.PORT || 3002 ;
app.listen(port, () => {
    console.log(`Connection on port ${port}`);
});
