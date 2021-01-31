//Access the router on Express 
const router = require('express').Router();

//Access the controllers
const controller = require('../controller/controller.js');

const User = require('../Utilisateur/user.js');
const JWT_SECRET = require('../secrets/secret');
const Jwt = require('jsonwebtoken');
const passport = require('passport')
const redis = require("redis");
const client = redis.createClient();

//CREATE
router.post("/user", (req, res) => {
     
    controller.create(req, res);

});

//READ
router.get("/users", (req, res) => {
    
    controller.reads(req, res);
    
});

router.get("/user/:id", (req, res) => {
    controller.read(req, res);
});

//UPDATE
router.put("/user/:id", (req, res) => {

    controller.update(req, res);
});

//DELETE
router.delete("/user/:id", (req, res) => {
    
    controller.delete(req, res);
});

router.get('/incrToken', (req, res) =>{
    const token = req.header('Authorization').replace('Bearer ', '')
    
    try{
        const payload = jwt.verify(token, JWT_SECRET) 
        
        client.get(token, (err, result) => {

            if (result !== null && result >= 10) {
                res.send('You are rate limited, wait a bit')
            } else {
                client.incr(token, (err, value) => {
                    if (err) {
                        console.error(err)
                        res.send(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
                    }
    
                    // It is not the best algorithm but every 10 minutes, you'll be given 10 more shots
                    if (value === 1) client.expire(token, 10)
                    res.send('L\'incrémentation a bien été effectuée')
                })
            }
        })

    } catch(error) {
        console.error(error.message)
        res.send('Vous n\'avez pas accès !')
    }
})

router.get('/createUser', async (req, res) => {
    // create a user a new user
    var testUser = new User({
        lastName: 'elhamar',
        firstName: 'jamar',
        mail: 'jmar777@gmail.com',
        password: 'Password123'
    });
  try {
      // save user to database
      await testUser.save() 
      res.send('Utilisateur crée')
    
  } catch (error) {
    res.send('Utilisateur deja utili')
    console.error(error);
  }
  
  })


  router.get('/testMdp', (req, res) => {
    // fetch user and test password verification
    User.findOne({ mail: 'jmar777@gmail.com' }, function (err, user) {
        if (err) throw err;
  
        // test a matching password
        user.comparePassword('Password123', function (err, isMatch) {
            if (err) throw err;
            console.log('Password123:', isMatch); // -> Password123: true
        });
  
        // test a failing password
        user.comparePassword('123Password', function (err, isMatch) {
            if (err) throw err;
            console.log('123Password:', isMatch); // -> 123Password: false
        });
    });
  
    res.send('Ca roule pour test')
  })

router.post('/login', (req, res) => {
    User.findOne({ mail: req.body.mail }, function (err, user) {
        if (err) throw err;
  
        // test a matching password
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err) throw err;
        
            if(req.body.password , isMatch){
                
                const token = Jwt.sign({id: user._id, password: user.password, mail: user.mail},
                JWT_SECRET,
                {expiresIn:'1 week'})

                res.send(token)
            } else {
                res.send("mot de passe ou email incorrect")
            }
        });


    });
});
router.get('/', passport.authenticate('jwt'), function (req, res){
    res.json(req.user)
});

  router.get('*', function(req, res){
    res.send('ERREUR 404', 404); //le contenu de la page en 1er paramètre, et en second le code erreur
  });


module.exports = router;