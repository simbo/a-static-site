/**
 * + Project Config
 * =====================================================================
 */

module.exports = (function(config) {

    var path = require('path');

    // project paths
    config.paths = (function(p) {
        p.root         = process.cwd();
        p.src          = p.root + '/src';
        p.web          = p.root + '/web';
        p.site         = p.src  + '/site';
        p.templates    = p.src  + '/templates';
        p.partials     = p.src  + '/partials';
        p.srcAssets    = p.site + '/assets';
        p.srcAssetsDev = p.src  + '/assets-dev';
        p.webAssets    = p.web  + '/assets';
        p.webAssetsDev = p.web  + '/assets-dev';
        return p;
    })({});

    // global watch task options
    config.watch = {
        mode: 'auto'
    };

    return config;
})({});

/* = Project Config */