var express = require('express');
var router = express.Router();
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'Password123',
  database : 'mydb'
});

var loggedInUser = null;

// Retrieve web pages

// Home page
router.get('/', function(req, res, next) {
  console.log(req.session.user);
  var loggedInUser = null;
  if(req.session.user){
    loggedInUser = req.session.user;
  }
  res.render('index', {loggedInUser});
});

// Pacman
router.get('/pacman', function(req, res, next) {
    loggedInUser = req.session.user
  res.render('pacman', {loggedInUser});
});

// Sign up
router.get('/signUp', function(req, res, next) {
    
  res.render('signUp');
});

// Log in
router.get('/login', function(req, res, next) {

  res.render('login');
});

// Database
router.get('/database', function(req, res, next) {
  connection.connect(function(err){
    connection.query('SELECT * FROM Population', function(err, results, fields){
      var population = results;
        //Create an empty object that we will fill with the table names
      var tableName = {};
      loggedInUser = req.session.user
        //Loop through the first person in the array and get the key (i.e id, firstName, lastName etc
      for(i in population[0]){
        tableName[i] = i;
      }
      res.render('database', {population, tableName, loggedInUser});
    });
  });
});

// Sign out
router.get('/signOut', function(req, res, next) {

    req.session.user = null;

  res.redirect('/')
});

// Profile
router.get('/profile', function(req, res, next) {
  loggedInUser = req.session.user
res.render('profile', {loggedInUser});
});

// Add new person to database

router.post('/newPerson', function(req, res, next) {
  console.log(req.body);

  if (req.body.firstName === '' || req.body.lastName === '' || req.body.age === '' || req.body.city === '' || req.body.country === 'r'){
    res.redirect('/database')
  } else {

    connection.connect(function(err){
      connection.query(`INSERT INTO Population (lastName, firstName, age, city, country) VALUES ('${req.body.firstName}', '${req.body.lastName}', ${req.body.age}, '${req.body.city}', '${req.body.country}');`, function(err, results, fields){
        if(err)
          throw err;

        res.redirect('/database')
      });
    }); 
  }
});



// Delete person from Population database

router.post('/deleteUser', function(req, res, next) {
  console.log(req.body);

  connection.connect(function(err){
    connection.query(`DELETE FROM Population WHERE id = (${req.body.buttonSubmit})`, function(err, results, fields){
      if(err)
        throw err;

      res.redirect('/database')
    });
  });
});



// Edit person in Population database

router.post('/editUser', function(req, res, next) {
  console.log(req.body);

    var user = JSON.parse(req.body.buttonSubmit)



  res.render('editUser', {user});
});

router.post('/updateUser', function(req, res, next) {
  console.log(req.body);

  connection.connect(function(err){
    connection.query(`UPDATE Population SET firstName ='${req.body.firstName}', lastName ='${req.body.lastName}', age =${req.body.age}, city ='${req.body.city}', country ='${req.body.country}' WHERE id = ${req.body.id};`, function(err, results, fields){
      if(err)
        throw err;

      res.redirect('/database')
    });
  });
});



// Sign up to User database

router.post('/signUpUser', function(req, res, next) {
  console.log(req.body);

  if (req.body.username === '' || req.body.email === '' || req.body.passhash === '' || req.body.confirmPassword === ''){
    res.redirect('/signUp')
  } else {

    if (req.body.passhash != req.body.confirmPassword) {
      //window.alert('Both passwords must match')
      console.log('oof')
      res.render('signUp', {error:'Both passwords must match'})
    } else {


      connection.connect(function(err){
        connection.query(`INSERT INTO Users (username, email, passhash) VALUES ('${req.body.username}', '${req.body.email}', '${req.body.passhash}');`, function(err, results, fields){
          if(err)
            throw err;

          res.redirect('/')

      });
    }); 
  }}
});



// Log back into the User database

router.post('/loginUser', function(req, res, next) {
  var exists = false;
  if (req.body.email === '' || req.body.passhash === '' ){
    res.redirect('/login')
  } else {
      connection.connect(function(err){
        connection.query(`SELECT * FROM Users`, function(err, results, fields){  
          console.log(results);    
          if(err)
            throw err;
   
          for(var i = 0; i < results.length; i++){
            if(req.body.email === results[i].email){
              if(req.body.passhash === results[i].passhash){

                req.session.user = {
                  email : req.body.email, username : results[i].username
                };

                return res.redirect('/');
              } else{
                return res.redirect('/login');
              }
            }
          }
        }); // end conncetion.query
      }); // end connection.connect
    } // end else
}); //end router.post

module.exports = router;