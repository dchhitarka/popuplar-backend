const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const routes = require('./routes');
const multer = require('multer');
const path = require('path');
const errorHandlers = require('./handlers/errorHandlers');
const cors = require('cors');
require('./handlers/passport');
require('dotenv').config();

const app = express();

// CORS
corsOptions = {
    origin: ['http://localhost:8000', 'http://192.168.1.14:8000'],
    credentials: true,
}
app.use(cors(corsOptions));

// Middleware
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// multer for multipart/form-data requests
app.use(express.static(__dirname + '/uploads'));

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE })
}));

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// Logger
app.use((req, res, next) => {
    // console.log("############### NEW REQUEST ###############");
    console.log(`Received ${req.method} ${req.url}`)
    // console.log(req.headers);
    // console.log(req.method == 'GET' ? req.query : req.body);    
    // console.log("############### REQUEST OVER ###############");
    next();
});

app.use(function (req, res, next) {
    res.on('finish', function () {
        console.log(`Processed ${req.method} ${req.url} - ${res.statusCode}`);
    });
    next();
});

// Routes
app.use('/api/', routes);
app.use('/public/images', express.static(__dirname + '/uploads'))
app.use(errorHandlers.notFound);

/* Error Handler - Prints stack trace */
app.get('env') === 'development' ?
    app.use(errorHandlers.developmentErrors) :
    app.use(errorHandlers.productionErrors);

// DB Connection
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('connected', () => console.log('Connected to DB!'));
mongoose.connection.on('error', () => console.log('Connection to DB failed!'));

// Start servers
app.listen(process.env.PORT, () => {
    console.log('Server is running on ', process.env.PORT);
})