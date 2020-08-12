const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const User = require('../models/user');
const autenticationMiddleware = require('../middlewares/auth');
const { checkValidation } = require('../middlewares/validation');

const utils = require('../utils');

router.post('/', autenticationMiddleware.isAuth, [
    check('username').isString(),
    check('password').isString().isLength({ min: 5 })
  ], checkValidation, function(req, res, next) {
    
    User.findOne({_id: res.locals.authInfo.userId}, "-password")
        .exec(function(err, user) {
            if(err) return res.status(500).json({error:err});
            if(!user) return res.status(404).json({message: 'User not found'})
            if (user.type !== 'admin') {
              return res.status(401).json({
                error: "Unauthorized",
                message: "You are not authorized to execute this operation"
              });
            }
        });

    const newUser = new User();
    newUser.username = req.body.username;
    newUser.password = new Buffer(
        crypto.createHash('sha256').update(req.body.password, 'utf8').digest()
      ).toString('base64');
    newUser.type = "user";  
    newUser.save(function(err){
      if(err) {
        if (err.code === 11000) {
          return res.status(409).json(
            {
              error: "Invalid username",
              message: "This username is already taken"
            }
          );
        }
        return res.status(500).json({error: err});
      }
      utils.registerAndEnrollUser(req.body.username, req.body.password);
      res.status(201).json(newUser);
    });
});

router.post('/enroll-admin', autenticationMiddleware.isAuth, function(req, res, next) {
  
  User.findOne({_id: res.locals.authInfo.userId}, "-password")
      .exec(function(err, user) {
          if(err) return res.status(500).json({error:err});
          if(!user) return res.status(404).json({message: 'User not found'})
          if (user.type !== 'admin') {
            return res.status(401).json({
              error: "Unauthorized",
              message: "You are not authorized to execute this operation"
            });
          }

          utils.enrollAdminUser(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
          return res.status(201).json({
            message: "Admin user succesfully enrolled"
          });
      });
});


module.exports = router;