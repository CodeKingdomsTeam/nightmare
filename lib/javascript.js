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
  (function javascript () {
    var log = console.log;
    var ipc = __nightmare.ipc;
    var sliced = __nightmare.sliced;
    console.log = function() {
      ipc.send('log', sliced(arguments).map(String));
    }
    var formatError = function(err) {

        if( err instanceof Error ) {

          err = err.message + '\\\n' + (err.stack ? err.stack : '');
        } else {

          return err;
        }

    };
    try {
      var response = ({{!src}})({{!args}});

      if( response && typeof response === 'object' && response.then ) {

        // TODO: Support fulfil with multiple values
        response.then(function(result) {

          ipc.send('response', result);

        }, function(err) {

          ipc.send('error', formatError(err));

        });

      } else {

        ipc.send('response', response);
      }
    } catch (err) {
      ipc.send('error', formatError(err));
    }
    console.log = log;
  })()
`;

/**
 * Inject the `src` on the client-side, capture
 * the response and logs, and send back via
 * ipc to electron's main process
 */

var inject = `
  (function javascript () {
    var log = console.log;
    var ipc = __nightmare.ipc;
    var sliced = __nightmare.sliced;
    console.log = function() {
      ipc.send('log', sliced(arguments));
    }
    try {
      var response = (function () { {{!src}} })()
      ipc.send('response', response);
    } catch (e) {
      ipc.send('error', e.message);
    }
    console.log = log;
  })()
`;

/**
 * Export the templates
 */

exports.execute = minstache.compile(execute);
exports.inject = minstache.compile(inject);
