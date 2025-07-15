const express = require('express');
const compression = require('compression');
const helmet = require("helmet");
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var User = require('./models/User');

// const mongoose = require('./utils/mongoose');
const constants = require('./utils/constants');

const app = express();

app.use(compression());
app.use(helmet());
app.use(cors());

// mongoose.connect(constants.mongoUrl);
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//     console.log('Mongoose connected.');
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


// Middleware to block download of .npl and .js files from browsers
app.use((req, res, next) => {
    const userAgent = req.get('User-Agent');
    const requestedFile = req.url;

    console.log(requestedFile);

    // Check if the request is for .npl or .js file type
    if (/\.(npl)$/i.test(requestedFile)) {
        console.log(userAgent);
        // Block the download if the request is from a browser
        if (/Mozilla\/5\.0|Chrome|Firefox|Safari|Edge/i.test(userAgent)) {
            console.log('Blocked download for browser request:', userAgent, requestedFile);
            return res.status(403).send('');
        }
    }
    // Proceed if the request is not a browser or for non-blocked files
    next();
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Controllers and routes
app.use(require('./controllers'));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use(function (err, req, res) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

var newdb = false;
if (newdb) {
    db.dropDatabase();
}

var seeding = false;
if (seeding) {
    User.createData({
        "email": "richardplayventures@gmail.com",
        "name": "richardmartin",
        "status": "admin"
    }, (err, data) => {
        console.log(err || data);
    });
}

module.exports = app;
