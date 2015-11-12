var request = require('request');
var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');

exports.handler = function (event, context) {
  var script = {
    contentUrl: 'http://api2.socialmention.com/search?lang=en&f=json&t[]=blogs&t[]=microblogs&t[]=news&from_ts=86400&q=',
    init: function() {
      var self = this;
      var keywords = (!_.isUndefined(event.keywords) && !_.isEmpty(event.keywords)) ? event.keywords : ['online marketing'];
      var keywordsNew = (!_.isUndefined(event.qs) && !_.isEmpty(event.qs)) ? event.qs : ['online marketing'];

      self.getContent(keywords).then(function(result) {
        var dataObj = {
          querystring: event,
          content: result.content
        }

        context.succeed({"result": dataObj});
      });
    },
    getContent: function(keywords) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var keywordUrl = '';
        _.each(keywords, function(item) {
          keywordUrl += item + '%20';
        });

        var requestUrl = self.contentUrl + keywordUrl;

        request(requestUrl, function (err, response, body) {
          if (err) console.log(err, err.stack);
          var items = JSON.parse(body).items;
          var result = { content: items }
          resolve(result);
        });
      });
    }
  }

  script.init();
};
