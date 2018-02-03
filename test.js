const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

    var options = {
      hostname: 'http://discordapp.com',
      path: '/api/users/@me',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer '+json.access_token
      }
    };

    http.request(options, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });

      //Handle end parsing
      res.on("end", () => {
        body = JSON.parse(body);
        console.log(body);
      });

      //Handle Error
      res.on("error", function(e) {
        console.log("Got error: " + e.message);
      });
    });