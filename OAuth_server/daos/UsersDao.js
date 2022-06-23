let MongoClient = require('mongodb').MongoClient;

const config = require('config');
const IP = config.get('DatabaseSection.IP');
const PORT = config.get('DatabaseSection.port');
const OAUTH_DB_NAME = config.get('DatabaseSection.oauthName');
const USERS_COLLECTION = config.get('DatabaseSection.usersCollection');

// Connection URI
const URI ="mongodb://"+IP+":"+PORT.toString()+"/";

// Funcion para insertar un usuario en la BD
exports.insert = function (userInfo){
    MongoClient.connect (URI, function (err, db) {
        if (err) throw err; 
        let dbo = db.db(OAUTH_DB_NAME);
        dbo.collection(USERS_COLLECTION).insertOne(userInfo, function(err, res) {
            err ? console.log("[Error] User not inserted" + err) : console.log("[+] User inserted") ;
            db.close();
        });
    });
}

// Funcion que busca un usuario en la BD en base a su ID.
exports.findOne = function(userId){
    return new Promise(function(resolve, reject) {
      if (userId.length > 0) {
        MongoClient.connect (URI, function(err, db){
          if (err) throw err; 
          let dbo = db.db(OAUTH_DB_NAME);
          dbo.collection(USERS_COLLECTION).findOne({_id: userId}).then(result => {
              if(result) {
                return resolve(result);
              } else {
                return resolve();
              }
          });        
        });
      } else {
        return resolve();
      }
    })
}
