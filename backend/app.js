#!/usr/bin/env node

const express = require('express');
const compression = require('compression');
const helmet = require("helmet");
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const debug = require('debug')('api.something.com:server');
const http = require('http');

// const mongoose = require('./utils/mongoose');
const constants = require('./utils/constants');
const User = require('./models/User');

const app = express();

console.error("123");
app.use(compression());
app.use(helmet());
app.use(cors());

// mongoose.connect(constants.mongoUrl);
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//     console.log('Mongoose connected.');
// });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware to block download of .npl files from browsers
app.use((req, res, next) => {
    const userAgent = req.get('User-Agent');
    const requestedFile = req.url;

    if (/\.(npl)$/i.test(requestedFile)) {
        if (/Mozilla\/5\.0|Chrome|Firefox|Safari|Edge/i.test(userAgent)) {
            console.log('Blocked browser download:', requestedFile);
            return res.status(403).send('');
        }
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./controllers'));

app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

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
        email: "richardplayventures@gmail.com",
        name: "richardmartin",
        status: "admin"
    }, (err, data) => {
        console.log(err || data);
    });
}

// --- VERCEL EXPORT ---
module.exports = serverless(app);

// --- LOCAL DEV ---
if (require.main === module) {
    const port = normalizePort(process.env.PORT || 3000);
    app.set('port', port);

    const server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', () => {
        const address = server.address();
        const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;
        debug('Listening on ' + bind);
        console.log('Listening on ' + bind);
    });

    function normalizePort(val) {
        const port = parseInt(val, 10);
        if (isNaN(port)) return val;
        if (port >= 0) return port;
        return false;
    }

    function onError(error) {
        if (error.syscall !== 'listen') throw error;
        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
            default:
                throw error;
        }
    }
}