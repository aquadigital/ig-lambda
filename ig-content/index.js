var request = require('request');
var Intercom = require('intercom-client');
var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');
var config = {
  testEvent: 'http://api2.socialmention.com/search?q=iphone+apps&f=json&t=blogs&lang=en',
  intercomID: 'dmqf1z3p',
  intercomKey: '692af63d625d711408ec565f121720c99bb6f6ed',
  intercomClient: {}
}

exports.handler = function (event, context) {
  var script = {
    client: {},
    segmentId: '563e604c1d0a4489dc0000a6',
    init: function() {
      var self = this;

      this.client = new Intercom.Client(config.intercomID, config.intercomKey);
      this.getUsers().then(function(users) {
        Promise.map(users, function(user) {
          return self.getContent(user);
        })
        .each(function(result) {
          return self.sendMessage(result.user, result.content)
          .then(function(user) {
            return self.updateUserLastSent(user);
          });
        })
        .then(function() {
          context.done(null, 'content-notification complete.');
        });
      });
    },
    getContent: function(user) {
      var self = this;
      return new Promise(function (resolve, reject) {
        request(config.testEvent, function (err, response, body) {
          if (err) console.log(err, err.stack);

          var content = '';
          var items = JSON.parse(body).items;

          items = _.first(items, 10);

          _.each(items, function(item) {
            content += '<h1>' + item.title + '</h1>';
          });

          var result = {
            user: user,
            content: content
          }

          resolve(result);
        });
      });
    },
    getUsers: function() {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.client.users.listBy({ segment_id: self.segmentId }, function(result) {
          if (result.statusCode === 200) {
            resolve(result.body.users);
          } else {
            reject('error talking to intercom.');
          }
        });
      });
    },
    sendMessage: function(user, contentResult) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var message = {
          message_type: "email",
          subject: "Here is some awesome content!",
          body: contentResult,
          template: "plain",
          from: {
            type: "admin",
            id: "77811"
          },
          to: {
            type: "user",
            id: user.id
          }
        }

        self.client.messages.create(message, function() {
          resolve(user);
        });
      });
    },
    updateUserLastSent: function(user) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var postData = {
          id: user.id,
          custom_attributes: {
            'last-suggested-content': moment().format()
          }
        }

        self.client.users.create(postData, function (r) {
          resolve();
        });
      });
    }
  }

  script.init();
};
