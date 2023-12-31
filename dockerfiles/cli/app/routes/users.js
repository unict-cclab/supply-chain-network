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
            if (user.role !== 'rca-admin') {
              return res.status(401).json({
                error: "Unauthorized",
                message: "You are not authorized to execute this operation"
              });
            }
            
            const newUser = new User();
            newUser.username = req.body.username;
            newUser.password = new Buffer(
                crypto.createHash('sha256').update(req.body.password, 'utf8').digest()
              ).toString('base64');
            newUser.role = "user";  
            newUser.save(async function(err){
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
              try {
                await utils.registerAndEnrollUser(req.body.username);
              } catch (err) {
                  User.remove({_id: newUser._id}, function(err) {
                    if(err) return res.status(500).json({error: err})
                  });
                  return res.status(500).json({error:{
                    message : err.message
                  }});
              }
              return res.status(201).json({
                message : 'Successfully registered and enrolled user ' + newUser.username
              });
        });
    });
});

router.post('/enroll-admins', autenticationMiddleware.isAuth, function(req, res, next) {
  
  User.findOne({_id: res.locals.authInfo.userId}, "-password")
      .exec(async function(err, user) {
          if(err) return res.status(500).json({error:err});
          if(!user) return res.status(404).json({message: 'User not found'})
          if (user.role !== 'rca-admin') {
            return res.status(401).json({
              error: "Unauthorized",
              message: "You are not authorized to execute this operation"
            });
          }
          try {
            await utils.enrollUser(process.env.RCA_ADMIN_USERNAME, process.env.RCA_ADMIN_PASSWORD);
            await utils.enrollUser(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
          } catch (err) {
              return res.status(500).json({error:{
                message : err.message
              }});
          }
          return res.status(201).json({
            message: "Admin users succesfully enrolled"
          });
      });
});


module.exports = router;