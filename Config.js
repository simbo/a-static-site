/**
 * + Project Build Config
 * =====================================================================
 */

module.exports = (function(config) {

    var path = require('path');

    // project paths
    config.paths = (function(p) {
        p.root      = process.cwd();
        p.bower     = path.join(p.root, 'bower_components'),
        p.src       = path.join(p.root, 'src'); // sources
        p.out       = path.join(p.root, 'out'); // output
        p.site      = path.join(p.src,  'site'); // site structure and documents
        p.templates = path.join(p.src,  'templates'); // templates
        p.assetsDev = path.join(p.src,  'assets-dev'); // unprocessed assets
        p.assets    = path.join(p.site, 'assets'); // static assets within site
        p.assetsOut = path.join(p.out,  'assets'); // assets within output
        return p;
    })({});

    // gulp default params
    config.gulpParams = {
        environment: 'production'
    };

    // global watch task options
    config.watch = {
        mode: 'auto'
    };

    // marked options
    config.marked = {
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    };

    // autoprefixer options
    config.autoprefixer = {
        browsers: [
            'last 2 versions',
            '> 2%',
            'Opera 12.1',
            'Firefox ESR'
        ]
    };

    // csswring options
    config.csswring = {
        preserveHacks: true
    };

    // coffeelint options
    // http://www.coffeelint.org/#options
    config.coffeelint = {
        indentation: {
            value: 4,
            level: 'error'
        }
    };

    // csslint options
    // https://github.com/CSSLint/csslint/wiki/Rules-by-ID
    config.csslint = {
        'box-sizing': false,
        'universal-selector': false,
        'compatible-vendor-prefixes': false
    };

    // config syync options
    // https://github.com/danlevan/gulp-config-sync
    config.configSync = {
        fields: [
            'name',
            'version',
            'description',
            'keywords',
            'version',
            'private'
        ],
        space: 2
    };

    return config;
})({});

/* = Project Build Config */
