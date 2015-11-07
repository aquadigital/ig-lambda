var request = require('request');
var Intercom = require('intercom-client');
var Promise = require('bluebird');
var _ = require('underscore');

exports.handler = function (event, context) {
  console.log('Querying SocialMention = ' + event.webpage);
  exports.getContent(event).then(function(content) {
    var client = new Intercom.Client('dmqf1z3p', '692af63d625d711408ec565f121720c99bb6f6ed');
    var message = {
      message_type: "email",
      subject: "Here is some awesome content!",
      body: content,
      template: "plain",
      from: {
        type: "admin",
        id: "77811"
      },
      to: {
        type: "user",
        id: "554e4b2585fc0947e600c68b"
      }
    }

    client.messages.create(message, function() {
      context.done(null, 'content-notification complete.');
    });
  });
};

exports.getContent = function(event) {
  return new Promise(function (resolve, reject) {
    request(event.webpage, function (err, response, body) {
      if (err) console.log(err, err.stack);
      var content = '';
      var items = JSON.parse(body).items;

      items = _.first(items, 10);

      _.each(items, function(item) {
        content += '<h1>' + item.title + '</h1>';
      });

      resolve(content);
    });
  });
};
