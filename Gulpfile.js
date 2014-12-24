/*
 * + Gulpfile
 * https://github.com/gulpjs/gulp/blob/master/docs/API.md
 * https://github.com/gulpjs/gulp/tree/master/docs/recipes
 * =====================================================================
 */
'use strict';

// node modules
var _            = require('lodash'),
    path         = require('path'),
    util         = require('util'),
    del          = require('del'),
    minimist     = require('minimist'),
    moment       = require('moment'),
    jade         = require('jade'),
    autoprefixer = require('autoprefixer-core'),
    mqpacker     = require('css-mqpacker'),
    csswring     = require('csswring'),
    uglify       = require('uglify-js'),
    highlightjs  = require('highlight.js'),
    runSequence  = require('run-sequence'),
    gulp         = require('gulp'),
    Metalsmith   = require('metalsmith');

// external data
var config   = require(process.cwd() + '/Config.js'),
    metadata = require(process.cwd() + '/Metadata.js'),
    pkg      = require(process.cwd() + '/package.json');

// auto-require plugin packages
var autoPlug = require('auto-plug'),
    // gulp plugins
    g   = autoPlug({
            config: pkg
        }),
    // metalsmith plugins
    ms  = autoPlug({
            prefix: 'metalsmith',
            config: pkg
        });


/**
 * + Parse CLI params
 * =====================================================================
 */

var params = (function(p){
        var cliParams = minimist(process.argv.slice(2));
        p.environment = cliParams.environment || cliParams.env || process.env.NODE_ENV || config.gulpParams.environment || 'production';
        return p;
    })({});

/* = Parse CLI params */


/**
 * + Stylus / CSS processing
 * =====================================================================
 */

gulp.task('build:css', function() {
    return gulp

        // grab all stylus files in stylus root folder
        .src(config.paths.assetsDev + '/stylus/*.styl')

        // pipe through stylus processor
        .pipe(g.stylus({
            // add imports and vendor folders to @import path
            paths: [
                path.join(config.paths.assetsDev, 'stylus/imports'),
                path.join(config.paths.assetsDev, 'vendor')
            ],
            // create sourcemaps containing inline sources
            sourcemap: {
                inline: true,
                sourceRoot: '.',
                basePath: path.join(path.relative(config.paths.out, config.paths.assetsOut), 'css')
            }
        }))

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init({
            loadMaps: true
        }))

        // pipe through postcss processor
        .pipe(g.postcss((function(postcssPlugins){
                // minify only when in production mode
                if (params.environment === 'production') {
                    postcssPlugins.push(csswring(config.csswring));
                }
                return postcssPlugins;
            })([
                autoprefixer(config.autoprefixer),
                mqpacker
            ])
        ))

        // pipe through csslint if in development mode
        .pipe(g.if(
            params.environment === 'development',
            g.csslint(config.csslint)
        ))
        .pipe(g.csslint.reporter())

        // write sourcemaps
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed styles
        .pipe(gulp.dest(path.join(config.paths.assetsOut, 'css')))

        // live-reload
        .pipe(g.connect.reload());

});

/* = Stylus / CSS processing */


/**
 * + Coffeescript / Javascript processing
 * =====================================================================
 */

gulp.task('build:js', function() {
    return gulp

        // grab all coffee files in coffeescript root folder
        .src(config.paths.assetsDev + '/coffee/*.coffee')

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init())

        // pipe though coffeelint if in development mode
        .pipe(g.if(
            params.environment === 'development',
            g.coffeelint(config.coffeelint)
        ))
        .pipe(g.coffeelint.reporter())

        // pipe though coffeescript processor
        .pipe(g.coffee({
            bare: true
        }))

        // uglify if in production mode
        .pipe(g.if(
            params.environment === 'production',
            g.uglify()
        ))

        // write sourcemaps containing inline sources
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed javascripts
        .pipe(gulp.dest(path.join(config.paths.assetsOut, 'js')))

        // live-reload
        .pipe(g.connect.reload());

});

/* = Coffeescript / Javascript processing */


/**
 * + Custom jade filters
 * =====================================================================
 */

// uglify inline scripts if in production mode
jade.filters.uglify = function(data, options) {
    return params.environment === 'production' ? uglify.minify(data, {fromString: true}).code : data;
}

/* = Custom jade filters */


/**
 * + Metalsmith rendering
 * =====================================================================
 */

gulp.task('build:site', function(done) {

    // parse metadata depending on environment
    _.forEach(metadata.environments, function(values, env) {
        if (params.environment===env) {
            metadata = _.merge(metadata, values);
        }
    });

    // localize moment
    moment.locale(metadata.dateLocale);

    // jade options
    var jadeLocals = {
            moment: moment,
            environment: params.environment
        },
        jadeOptions = {
            pretty: params.environment=='development' ? true : false,
            directory: path.relative(config.paths.root, config.paths.templates),
        };

    // set default template to a metalsmith stream
    function defaultTemplate(template) {
        return ms.each(function(file, filename) {
            if (!file.template && file.template!==null) {
                file.template = template;
            }
        });
    }

    // go metalsmith!
    var metalsmith = new Metalsmith(config.paths.root)

        // set basic options
        .source(config.paths.site)
        .destination(config.paths.out)
        .metadata(metadata)
        .clean(false)

        // enable drafts
        .use(ms.drafts())

        // define collections
        .use(ms.collections({
            posts: {
                pattern: 'blog/**/*',
                sortBy: 'date',
                reverse: true
            }
        }))

        // render markdown
        .use(ms.branch([
                '**/*.md'
            ])
            .use(ms.markdown(_.merge(config.marked, {
                highlight: function (code) {
                    return highlightjs.highlightAuto(code).value;
                }
            })))
        )

        // render jade files
        .use(ms.branch([
                '**/*.jade'
            ])
            .use(ms.jade(_.merge({
                locals: _.merge(metadata, jadeLocals)
            }, jadeOptions)))
        )

        // generate excerpts
        .use(ms.betterExcerpts())

        // parse content
        .use(ms.branch([
                '**/*.html',
                '!blog/**/*'
            ])
            .use(defaultTemplate('page.jade'))
            .use(ms.permalinks({
                relative: false
            }))
        )

        // parse blog
        .use(ms.branch([
                'blog/**/*.html'
            ])
            .use(ms.dateInFilename())
            .use(defaultTemplate('post.jade'))
            .use(ms.permalinks({
                pattern: 'blog/:date/:title',
                date: 'YYYY/MM',
                relative: false
            }))
        )

        // set absolute urls
        .use(ms.branch([
                '**/*.html'
            ])
            .use(ms.each(function(file, filename) {
                file.url = metadata.baseUrl + file.path;
            }))
        )

        // render templates
        .use(ms.templates(_.merge({
            engine: 'jade'
        }, jadeOptions, jadeLocals)))

        // put everything together...
        .build(function(err) {
            if (err) throw err;
            done();
        });

});

/* = Metalsmith rendering */


/**
 * + Watch Task
 * =====================================================================
 */

gulp.task('watch', function() {

    // show watch info in console
    function logWatchInfo(event) {
        var eventPath = path.relative(config.paths.root, event.path),
            eventMessage = 'File ' + eventPath + ' was ' + event.type + ', running tasks...';
        console.log(eventMessage);
    }

    // watch site and and templates
    gulp.watch([
        'site/**/*',
        'templates/**/*'
    ], _.merge({
        cwd: config.paths.src
    }, config.watch), function(event) {
        logWatchInfo(event);
        runSequence(
            'build:site',
            'reload'
        );
    });

    // watch stylus files in assets-dev
    gulp.watch([
        'stylus/**/*.styl'
    ], _.merge({
        cwd: config.paths.assetsDev
    }, config.watch), function(event) {
        logWatchInfo(event);
        gulp.start('build:css');
    });

    // watch coffeescript files in assets-dev
    gulp.watch([
        'coffee/**/*.coffee'
    ], _.merge({
        cwd: config.paths.assetsDev
    }, config.watch), function(event) {
        logWatchInfo(event);
        gulp.start('build:js');
    });

});

/* = Watch Task */


/**
 * + Serve task
 * =====================================================================
 */

// webserver for development
gulp.task('serve', function() {
    g.connect.server({
        root: config.paths.out,
        host: 'localhost',
        port: 8888,
        livereload: true
    });
});

// trigger live-reload
gulp.task('reload', function() {
    gulp.src(config.paths.out)
        .pipe(g.connect.reload());
})

/* = Serve task */


/**
 * + Copy tasks
 * =====================================================================
 */

// copy all dependencies
gulp.task('copy:deps', ['clean:deps'], function(done) {
    runSequence(
        [
            'copy:jquery',
            'copy:normalize',
            'copy:highlightjs'
        ],
        done
    );
});

// copy jquery local alternative
gulp.task('copy:jquery', function() {
    return gulp
        .src([
            '*'
        ], {
            cwd: path.join(config.paths.bower, 'jquery/dist')
        })
        .pipe(gulp.dest(path.join(config.paths.assets, 'vendor/jquery')));
});

// copy normalize.css as stylus
gulp.task('copy:normalize', function() {
    return gulp
        .src([
            'normalize.css'
        ], {
            cwd: path.join(config.paths.bower, 'normalize.css')
        })
        .pipe(g.extReplace('.styl'))
        .pipe(gulp.dest(path.join(config.paths.assetsDev, 'vendor/normalize')));
});

// copy highlightjs theme as stylus
gulp.task('copy:highlightjs', function() {
    return gulp
        .src([
            'github.css'
        ], {
            cwd: path.join(config.paths.bower, 'highlightjs/styles')
        })
        .pipe(g.extReplace('.styl'))
        .pipe(gulp.dest(path.join(config.paths.assetsDev, 'vendor/highlightjs')));
});

/* = Copy tasks */


/**
 * + Clean Tasks
 * =====================================================================
 */

// clean generated content
gulp.task('clean:out', function(done) {
    del(config.paths.out, done);
});

// clean all dependencies
gulp.task('clean:deps', function(done) {
    del([
        path.join(config.paths.assets, 'vendor'),
        path.join(config.paths.assetsDev, 'vendor')
    ], done);
});

/* = Clean Tasks */


/**
 * + Common tasks
 * =====================================================================
 */

// default task
gulp.task('default', ['build']);

// full build
gulp.task('build', ['copy:deps', 'clean:out'], function(done) {
    runSequence(
        [
            'build:site',
            'build:css',
            'build:js'
        ],
        done
    );
});

// build, serve and watch
gulp.task('dev', ['build'], function() {
    gulp.start('serve', 'watch');
});

/* = Common tasks */


/* = Gulpfile */
