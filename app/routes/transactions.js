const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const User = require('../models/user');
const autenticationMiddleware = require('../middlewares/auth');
const { checkValidation } = require('../middlewares/validation');

const utils = require('../utils');

router.post('/submit', autenticationMiddleware.isAuth, [
    check('args').isArray()
  ], checkValidation, function(req, res, next) {
    
    User.findOne({_id: res.locals.authInfo.userId}, "-password")
        .exec(async function(err, user) {
            if(err) return res.status(500).json({error:err});
            if(!user) return res.status(404).json({message: 'User not found'});
            if (user.role === 'rca-admin') {
              return res.status(401).json({
                error: "Unauthorized",
                message: "You are not authorized to execute this operation"
              });
            }
            try {
                let args = req.body.args;
                args.forEach((val, index) => {
                  if(args[index].constructor == Object || args[index].constructor == Array)
                    args[index] = JSON.stringify(args[index]);
                });
                const result = await utils.submitTransaction(user.username, args);
                res.status(200).json({
                  message : result
                });
            } catch (err) {
                return res.status(500).json({error:{
                  message : err.message
                }});
            }
        });
});

router.post('/evaluate', autenticationMiddleware.isAuth, [
  check('args').isArray()
], checkValidation, function(req, res, next) {
  
  User.findOne({_id: res.locals.authInfo.userId}, "-password")
      .exec(async function(err, user) {
          if(err) return res.status(500).json({error:err});
          if(!user) return res.status(404).json({message: 'User not found'});
          if (user.role === 'rca-admin') {
            return res.status(401).json({
              error: "Unauthorized",
              message: "You are not authorized to execute this operation"
            });
          }
          try {
              let args = req.body.args;
              args.forEach((val, index) => {
                if(args[index].constructor == Object || args[index].constructor == Array)
                  args[index] = JSON.stringify(args[index]);
              });
              const result = await utils.evaluateTransaction(user.username, args);
              res.status(200).json({
                message : result
              });
          } catch (err) {
              return res.status(500).json({error:{
                message : err.message
              }});
          }
      });
});

module.exports = router;