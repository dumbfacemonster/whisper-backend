var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody')

// New User : OK
router.post('/signup', (req, res)  => {
  if (!checkBody(req.body, ['firstname', 'username', 'password'])) {
    res.json({result: false, error: "Missing or empty fields"});
    return;
  }
  User.findOne({username: req.body.username})
  .then(data => {
    if (data === null) {
      const token = uid2(32);
      const hash = bcrypt.hashSync(req.body.password, 1);

      const newUser = new User ({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token,
      });
      newUser.save().then(() => {
        res.json({result: true, newUser})
      })
    }
    else {
      res.json({result: false, error: "User already exists"})
    }
  })
});

// Login : OK
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({result: false, error: "Missing or empty fields"});
    return;
  }
  User.findOne({username: req.body.username})
  .then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({result: true, user: data})
    }
    else {
      res.json({result: false, error: "Incorrect user or password"})
    }
  })
})

module.exports = router;
