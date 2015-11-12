var request = require('request');
var Intercom = require('intercom-client');
var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');
var query = require('querystring').parse(event.querystring)

exports.handler = function (event, context) {
  var script = {
    contentUrl: 'http://api2.socialmention.com/search?lang=en&f=json&t=blogs&from_ts=86400&q=',
    init: function() {
      var self = this;
      var keywords = query['keywords'];

      self.getContent(keywords).then(function(result) {
        context.done(null, result);
      });
    },
    getContent: function(keywords) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var keywords = JSON.parse(user['custom_attributes']['content-keywords']);
        var keywordUrl = '';

        _.each(keywords, function(item) {
          keywordUrl += item + '%20';
        });

        var requestUrl = self.contentUrl + keywordUrl;

        request(requestUrl, function (err, response, body) {
          if (err) console.log(err, err.stack);

          var content = '';
          var items = JSON.parse(body).items;

          items = _.first(items, 10);

          _.each(items, function(item) {
            content += '<h1>' + item.title + '</h1>';
          });

          var result = {
            content: content
          }

          resolve(result);
        });
      });
    }
  }

  script.init();
};
