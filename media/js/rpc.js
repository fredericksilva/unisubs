goog.provide('mirosubs.Rpc');

mirosubs.Rpc.BASE_URL = "";

mirosubs.Rpc.logger_ =
    goog.debug.Logger.getLogger('mirosubs.Rpc');

mirosubs.Rpc.call = function(methodName, args, opt_callback) {
    var s = goog.json.serialize;
    var p = goog.json.parse;
    var serializedArgs = {};
    for (var param in args)
        serializedArgs[param] = s(args[param]);
    mirosubs.Rpc.logger_.info('calling ' + methodName + ': ' + s(args));
    if (mirosubs.Rpc.BASE_URL.substr(0, 1) != '/' && 
        !goog.Uri.haveSameDomain(mirosubs.Rpc.BASE_URL, window.location.href)) {
        goog.net.CrossDomainRpc.send([mirosubs.Rpc.BASE_URL, "xd/", methodName].join(''),
                                     function(event) {
                                         var responseText = event["target"]
                                             ["responseText"];
                                         mirosubs.Rpc.logger_.info(methodName + 
                                                                   ' response: ' +
                                                                   responseText);
                                         if (opt_callback)
                                             opt_callback(p(responseText))
                                     }, "POST",
                                     serializedArgs);
    } else {
        var postContent = "";
        var isFirst = true;
        for (var param in serializedArgs) {
            if (!isFirst)
                postContent += "&";
            isFirst = false;
            postContent += (param + "=" + encodeURIComponent(serializedArgs[param]));
        }
        goog.net.XhrIo.send([mirosubs.Rpc.BASE_URL, "xhr/", methodName].join(''),
                            function(event) {
                                if (opt_callback)
                                    opt_callback(event.target.getResponseJson());
                            }, "POST",
                            postContent);
    }
};
