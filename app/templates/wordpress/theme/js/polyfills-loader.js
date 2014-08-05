(function (window, document, undefined) {
    Modernizr.load([{
        test: Modernizr.mediaqueries,
        nope: templateUri + '/js/lib/respond.min.js'
    },{
        test: Modernizr.lastchild,
        nope: [templateUri + '/js/lib/nwmatcher-1.2.5.js', templateUri + '/js/lib/selectivizr.js']
    }]);
})(window, document);