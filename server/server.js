

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('../passport/passport')
const routeUser = require('../routes/route')
const app = express()
const port = 3000


app.use(bodyParser.json())
app.use(passport.initialize())


var mongoose = require('mongoose')
app.use(routeUser);



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

var connStr = 'mongodb://localhost:27017/TP1';
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

