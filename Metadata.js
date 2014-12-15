/**
 * + Metalsmith metadata
 * =====================================================================
 */

module.exports = (function(metadata) {

    var _ = require('lodash');

    metadata = _.merge(metadata, {

        siteTitle:          'A Static Site',
        siteDescription:    'Some informative description for search engine results.',

        baseUrl:            '//mysuperawesomestaticsite.io/',

        styles:             [
                                'assets/css/main.css'
                            ],
        scripts:            [
                                'assets/js/main.js'
                            ],

        googleAnalytics:    'UA-12345678-9',

        googleFonts:        [
                                'Open+Sans:300italic,400italic,700italic,700,300,400:latin',
                                'Source+Code+Pro:400,700:latin'
                            ],

        dateLocale:         'de',
        dateFormat:         'Do MMM YYYY',
        dateFormatShort:    'DD.MM.YY',
        dateFormatLong:     'dddd, Do MMMM YYYY'

    });

    // metadata changes depending on environment
    metadata.environments = {

        development: {
            baseUrl:            '//localhost:8888/',
            googleAnalytics:    false
        }

    };

    // get jQuery version from bower.json
    metadata.jqueryVersion = (function() {
        var bowerPkg = require(process.cwd() + '/bower.json'),
            jqueryVersion = '';
        _.forEach(bowerPkg.devDependencies, function(version, pgkName) {
            if (pgkName === 'jquery') {
                jqueryVersion = version.replace(/[^.0-9]/g, '');
                return false;
            }
        });
        return jqueryVersion;
    })();

    return metadata;
})({});

/* = Metalsmith metadata */
