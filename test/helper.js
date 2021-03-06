afterEach(function() {
  if (typeof(window) === 'undefined') {
    return;
  }
  //purge test area after each test
  var elements = document.getElementById('test').getElementsByTagName('*'),
      i, element;

  for (i = 0; i < elements.length; i++) {
    element = elements[i];
    element.parentNode.removeChild(element);
  }
});


(function(exports) {

  var isNode = (typeof(window) === 'undefined');

  if (isNode) {
    exports.expect = require('expect.js');
  } else {
    window.navigator;
  }

  exports.requireBundles = {
    '*test-agent/browser-worker': [
      '/lib/test-agent/responder.js',
      '/lib/test-agent/loader.js',
      '/lib/test-agent/sandbox.js',
      '/lib/test-agent/websocket-client.js',
      '/lib/test-agent/browser-worker.js',
      '/test/test-agent/factory/browser-worker.js'
    ]
  };

  exports.requireLib = exports.require_lib = function(url) {

    if (exports.requireBundles[url]) {
      exports.requireBundles[url].forEach(function(url) {
        require(url);
      });
      return;
    }

    if (typeof(require) !== 'undefined') {
      if (isNode) {
        return require('../lib/' + url);
      } else {
        require('/lib/' + url);
      }
    }
  };

  exports.cross = {

    nsFind: function(obj, string) {
      var result = obj,
          part,
          parts = string.split('.');

      while ((part = parts.shift())) {
        if (result[part]) {
          result = result[part];
        } else {
          throw new Error('Cannot find ' + string + ' in object ');
        }
      }
      return result;
    },

    require: function(path, component, cb) {

      if (!path.match(/.js$/)) {
        path += '.js';
      }

      path = '/lib/' + path;

      if (isNode) {
        cb(require('..' + path));
      } else {
        exports.require(path, function() {
          cb(this.nsFind(exports, component));
        }.bind(this));
      }
    }
  };


  exports.testSupport = {
    merge: function() {
      var result = {};
      Array.prototype.slice.call(arguments).forEach(function(mergeSet) {
        var key;

        for (key in mergeSet) {
          if (mergeSet.hasOwnProperty(key)) {
            result[key] = mergeSet[key];
          }
        }
      });

      return result;
    },

    factory: function(defaults, constructor) {
      var factory = function() {
        return new constructor(
          factory.attributes.apply(null, arguments)
        );
      };

      factory.attrs = factory.attributes = function() {
        var args = Array.prototype.slice.call(arguments), key, attrs;
        args.unshift(defaults);

        attrs = exports.testSupport.merge.apply(null, args);

        for (key in attrs) {
          if (attrs.hasOwnProperty(key)) {
            if (typeof(attrs[key]) === 'function') {
              attrs[key] = attrs[key](args);
            }
          }
        }

        return attrs;

      };

      return factory;
    }
  };

}(
  (typeof(window) === 'undefined') ? global : window
));

