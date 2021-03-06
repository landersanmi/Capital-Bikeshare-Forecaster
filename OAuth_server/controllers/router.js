let express = require('express');
let router = express.Router()
let usersController = require('./Users');

const YAML = require('yamljs');
let swaggerUi = require("swagger-ui-express");
let swaggerDoc = YAML.load('./api/openapi.yaml');

const keys = require('../../keys.json');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const axios = require('axios');

const config = require('config');
const IP = config.get('ServerSection.IP');
const PORT = config.get('ServerSection.port');
const MAPVISUALIZER_SERVER_IP = config.get('MapVisualizerServerSection.IP');
const MAPVISUALIZER_SERVER_PORT = config.get('MapVisualizerServerSection.port');

const LANGUAGES = ['en', 'es', 'eu'];


// ###########  API  ########### //
router.use('/ui', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Como no funciona el router añadire las routas a mano
router.get('/api/v1/user/:user_id', function(req, res){
  usersController.getUser(req, res, undefined ,req.params.user_id);
});
router.post('/api/v1/user/:user_id', function(req, res){
  usersController.postUser(req, res, "", req.body, req.params.user_id);
});

router.get('/', function(req, res){
  res.redirect('/login');
});
router.use('/login', function(req, res) {
  let lang = req.acceptsLanguages()[0];
  if(LANGUAGES.includes(lang) &&  req.query.clang == undefined) {
      if(lang == 'eu'){ lang = 'eu_ES'}
      res.redirect('/login?clang=' + lang);
  }else{
      res.render('pages/auth');
  }
});

/*  PASSPORT SETUP  */
let userProfile;
let token;

router.use(passport.initialize());
router.use(passport.session());

router.get('/success', (req, res) => res.send(userProfile));
router.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  GOOGLE OAUTH  */
/* ############################## [API KEYS] ##########################################*/
const GOOGLE_CLIENT_ID = keys['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = keys['GOOGLE_CLIENT_SECRET'];
/* ####################################################################################*/

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://"+IP+":"+PORT.toString()+"/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile = profile;
      token = accessToken;
      return done(null, userProfile, token);
  }
));
 
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function(req, res) {
    // Successful authentication, redirect success.
    let userInfo =  { _id: userProfile['id'],
                      full_name: userProfile['displayName'],
                      email: userProfile['emails'],
                    }

    // Peticion getUser
    const getUserRequest = {
      method: 'GET',
      mode: 'cors',
      cache: 'default'
    };
    // Peticion postUser
    const postUserRequest = {
      method: 'POST',
      mode: 'cors',
      cache: 'default',
      body: userInfo
    };
    let userUrl = 'http://'+IP+':'+PORT.toString()+'/api/v1/user/' + userInfo['_id'];
    // Funcion para consultar si existe en la BD el usuario, si no existe se añade
    // Se hace uso de la API proporcionada por el propio microservicio
    (async () => {
      const user = await axios.get(userUrl, getUserRequest);
      // Si el usuario llega como 'undefined', significa que no existe en la BD por lo que lo añadiremos
      if(user.data === 'undefined'){
        (async () => {
          axios.post(userUrl, postUserRequest);
        })();
      }else{
        console.log("[LOG-IN] El usuario ya existe en la BD");
      }
    })();

    res.redirect(301,'http://'+MAPVISUALIZER_SERVER_IP+':'+MAPVISUALIZER_SERVER_PORT.toString()+'/login?token=' + token);

});

module.exports = router
