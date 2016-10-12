var express = require('express')
var proxy = require('express-http-proxy');
var app = express();

app.use(express.static('./'));
app.use('/blueant', proxy('https://blueant-uat.sinnerschrader.com', {
    forwardPath: function (req, res) {
        var path = require('url').parse(req.url).path;
        return '/blueant' + path;
    }
}));

app.listen(3000);
