/**
 * + Metalsmith metadata
 * =====================================================================
 */

module.exports = (function(metadata) {

    metadata = {
        title:              "Simbo's Metalsmith Poject",
        description:        "Some informative description for search engine results.",
        styles:             [
                                '/assets/css/main.min.css'
                            ],
        scripts:            [
                                '/assets/js/main.min.js'
                            ],
        jqueryVersion:      '2.1.1',
        googleAnalytics:    'UA-12345678-9',
        googleFonts:        [
                                'Open+Sans:300italic,400italic,700italic,700,300,400:latin',
                                'Source+Code+Pro:400,700:latin'
                            ],
        dateFormat:         "Do MMM YYYY",
        dateFormatShort:    "DD.MM.YY",
        dateFormatLong:     "dddd, Do MMMM YYYY",
        excerptLength:      140
    };

    return metadata;
})({});

/* = Metalsmith metadata */