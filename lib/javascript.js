/**
 * Module Dependencies
 */

var minstache = require('minstache');

/**
 * Run the `src` function on the client-side, capture
 * the response and logs, and send back via
 * ipc to electron's main process
 */

var execute = `
(async function javascript () {
  var ipc = __nightmare.ipc;

  var prefixError = function(err) {

    err.message = 'Error from .evaluate() or .wait() code: ' + err.message;
  };

  try {
    var fn = ({{!src}}),
      response,
      args = [];

    {{#args}}args.push({{!argument}});{{/args}}

    if(fn.length - 1 == args.length) {

      args.push(((err, v) => {
          if(err) {
            ipc.send('error', err.message || err.toString());
          }
          ipc.send('response', v);
        }));
      fn.apply(null, args);
    }
    else {
      response = await fn.apply(null, args);
      ipc.send('response', response);
    }
  } catch (err) {
    prefixError(err);
    ipc.send('error', __nightmare.formatError(err));
  }
})()
`;

/**
 * Inject the `src` on the client-side, capture
 * the response and logs, and send back via
 * ipc to electron's main process
 */

var inject = `
(function javascript () {
  var ipc = __nightmare.ipc;
  try {
    var response = (function () { {{!src}} \n})()
    ipc.send('response', response);
  } catch (e) {
    ipc.send('error', e.message);
  }
})()
`;

/**
 * Export the templates
 */

exports.execute = minstache.compile(execute);
exports.inject = minstache.compile(inject);