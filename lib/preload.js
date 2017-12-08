window.__nightmare = {};
__nightmare.ipc = require('electron').ipcRenderer;
__nightmare.sliced = require('sliced');

__nightmare.formatError = function(err) {

    if (err instanceof Error) {

        err = err.message + '\\\n' + (err.stack ? err.stack : '');
    }

    return err;
};

// Listen for error events
window.addEventListener('error', function(e) {
    __nightmare.ipc.send('page', 'error', e.message, e.error.stack);
});

(function() {

    var consolePass = function(name) {

        var defaultLog = console[name];
        console[name] = function() {

            var args = __nightmare.sliced(arguments);

            for (var i = 0; i < args.length; i++) {

                if (args[i] && typeof args[i].constructor === 'object') {

                    args[i] = '[Omitted Object/Array]';
                } else {

                    args[i] = __nightmare.formatError(args[i]);
                }
            }
            __nightmare.ipc.send('console', name, args);
            return defaultLog.apply(this, arguments);
        };

    };

    consolePass('log');
    consolePass('info');
    consolePass('warn');
    consolePass('error');

    // overwrite the default alert
    window.alert = function(message) {
        __nightmare.ipc.send('page', 'alert', message);
    };

    // overwrite the default prompt
    window.prompt = function(message, defaultResponse) {
        __nightmare.ipc.send('page', 'prompt', message, defaultResponse);
    }

    // overwrite the default confirm
    window.confirm = function(message, defaultResponse) {
        __nightmare.ipc.send('page', 'confirm', message, defaultResponse);
    }
})()