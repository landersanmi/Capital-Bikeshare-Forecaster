'use strict'
let express = require("express");
let fs = require('fs')
let morgan = require("morgan");
let path = require("path");
const session = require('express-session');
const bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let i18n = require("i18n-express");
let router = require('./controllers/router')

const config = require('config');
const SERVER_PORT = config.get('ServerSection.port');

// LOG file
let log = fs.createWriteStream(path.join(__dirname, config.get('PathsSection.logPath')), { flags: 'a' });

// Initialize APP
let app = express();

// APP Config
app.use(morgan('combined', { stream: log }))
app.use(bodyParser.json({ limit: '14MB' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'ejs');
app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'),
  siteLangs: ["en","es", "eu_ES"],
  defaultLang: 'es',
  textsVarName: 'translation'
}));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

// ADD router
app.use(router)

// START APP
app.listen(SERVER_PORT, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', SERVER_PORT, SERVER_PORT);
    console.log('Swagger-ui is available on http://localhost:%d/ui', SERVER_PORT);
});