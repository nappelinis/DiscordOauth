const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
//const http = require("http");
const request = require('request');
const { catchAsync } = require('../utils');
const mysql = require('../mysql.js');

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent('http://104.236.231.76:50451/api/discord/callback');


router.get('/login', (req, res) => {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});

router.get('/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const dc_auth_response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
      },
    });
  const json = await dc_auth_response.json();

  //Discord User Bearer Call
  const dc_user_response = await fetch(`http://discordapp.com/api/users/@me`,
  {
    method: 'GET',
    headers: {
      Authorization: `Bearer `+json.access_token
    },
  });
  const user = await dc_user_response.json();

  //Mysql
  //Check for existing -> update
  mysql.checkExisting(user.id, function(err, result)
  {
    if(err) console.log(err);
    else {
      //Found entry -> run update
      if(result.length > 0) {
        //Update by userid
        mysql.updateToken(user.id, user.username, user.mfa_enabled, user.avatar, json.access_token, json.expires_in, json.refresh_token, function(err, result) {
          if(err) console.log(err);
          else {
            console.log("Discord Token for user "+user.username+" has been updated!");
          }
        });
      }
      else {
        //Else -> Insert
        mysql.insertToken(user.username, user.discriminator, user.mfa_enabled, user.id, user.avatar, json.access_token, json.expires_in, json.refresh_token, function(err, result)
        { 
          if(err) console.log(err); 
          else {
            console.log("Discord Token for "+user.username+" entered into DB");
          }
        });
      }
    }
  });




    res.redirect(`/?username=${user.username}&userid=${user.id}`);
  }));



// router.get('/callback', catchAsync(async (req, res) => {
//   if (!req.query.code) throw new Error('NoCodeProvided');
//   const code = req.query.code;
//   const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
//   const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
//     {
//       method: 'POST',
//       headers: {
//         Authorization: `Basic ${creds}`,
//       },
//     });
//   const json = await response.json();

//   //Store token
//   mysql.insertToken(json.access_token, function(err, result) {
//   	if(err) { console.log("Failed to save token "+err.toString()); } // add db error logging
//   	else { console.log("Added token "+json.access_token); }
//   });



//   res.redirect(`/?token=${json.access_token}`);
// }));



// Refresh token code
// API_ENDPOINT = 'https://discordapp.com/api/v6'
// CLIENT_ID = '332269999912132097'
// CLIENT_SECRET = '937it3ow87i4ery69876wqire'
// REDIRECT_URI = 'https://nicememe.website'

// def refresh_token(refresh_token):
//   data = {
//     'client_id': CLIENT_ID,
//     'client_secret': CLIENT_SECRET,
//     'grant_type': 'refresh_token',
//     'refresh_token': refresh_token,
//     'redirect_uri': REDIRECT_URI
//   }
//   headers = {
//     'Content-Type': 'application/x-www-form-urlencoded'
//   }
//   r = requests.post('%s/oauth2/token' % API_ENDPOINT + 'token', data, headers)
//   r.raise_for_status()
//   return r.json()



module.exports = router;