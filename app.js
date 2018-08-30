var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');
var iplocation = require('iplocation')
// grab the url model
var Url = require('./models/url');
const normalizeUrl = require('normalize-url');
var ip = ''

// In your js file (e.g. app.js)
 var get_ip = require('ipware')().get_ip;
 
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

function getIp(req, res, next){
  var ip_info = get_ip(req);
  var re = /\s*:\s*/;
  ip = ip_info.clientIp.split(re);
  ip = ip[ip.length - 1]
  console.log('ip',ip)
  next()
}

app.post('/api/shorten', function(req, res){
  var longUrl = normalizeUrl(req.body.url);
  var shortUrl = '';
  // check if url already exists in database
  Url.findOne({long_url: longUrl}, function (err, doc){
    if (doc){
      shortUrl = config.webhost + 'url/' + base58.encode(doc._id);
      // the document exists, so we return it without creating a new entry
      res.send({'shortUrl': shortUrl});
    } else {
      shortUrl = config.webhost + 'url/' + base58.encode(newUrl._id);
      // since it doesn't exist, let's go ahead and create it:
      var newUrl = Url({
        long_url: longUrl,
        short_url: shortUrl
      });
      // save the new link
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }
        res.send({'shortUrl': shortUrl});
      });
    }
  });
});

app.get('/url/:encoded_id', getIp, function(req, res){
  var id = parseInt( req.params.encoded_id) - 1;
  // check if url already exists in database
  Url.findByIdAndUpdate({_id: id},{$inc: {click: 1} }, function (err, doc){
    console.log('doc', doc)
    if (doc) {
      iplocation(ip, function (error, res) {
        console.log('res',res)
      })
      res.redirect(doc.long_url);
    } else {
      res.redirect(config.webhost);
    }
  });

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
