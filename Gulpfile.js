/*
 * + Gulpfile
 * https://github.com/gulpjs/gulp/blob/master/docs/API.md
 * https://github.com/gulpjs/gulp/tree/master/docs/recipes
 * =====================================================================
 */

// required modules
var config         = require(process.cwd() + '/Config.js'),
    metadata       = require(process.cwd() + '/Metadata.js'),
    path           = require('path'),
    util           = require('util'),
    del            = require('del'),
    Metalsmith     = require('metalsmith'),
    branch         = require('metalsmith-branch'),
    ignore         = require('metalsmith-ignore'),
    drafts         = require('metalsmith-drafts'),
    templates      = require('metalsmith-templates'),
    markdown       = require('metalsmith-markdown'),
    dateInFilename = require('metalsmith-date-in-filename');
    permalinks     = require('metalsmith-permalinks'),
    collections    = require('metalsmith-collections'),
    _              = require('lodash'),
    gulp           = require('gulp'),
    stylus         = require('gulp-stylus'),
    sourcemaps     = require('gulp-sourcemaps');


/**
 * + Stylus / CSS processing
 * =====================================================================
 */
gulp.task('build-css', function() {
    gulp.src(config.paths.srcAssetsDev + '/stylus/main.styl')
        .pipe(stylus({
            paths: [
                config.paths.srcAssetsDev + '/stylus/imports'
            ],
            sourcemap: {
                inline: true,
                sourceRoot: '.',
                basePath: 'assets/css'
            }
        }))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))
        .pipe(gulp.dest(config.paths.webAssets + '/css'));
});
/* = Stylus / CSS processing */


/**
 * + Metalsmith rendering
 * =====================================================================
 */
gulp.task('render', function() {
    var metalsmith = new Metalsmith(config.paths.root);
    // set metalsmith options
    metalsmith.source(config.paths.site)
        .destination(config.paths.web)
        .metadata(metadata)
        .clean(false)
        .use(drafts())
        // create collections
        .use(collections({
            posts: {
                pattern: 'blog/**/*',
                sortBy: 'date',
                reverse: true
            }
        }))
        // parse all markdown
        .use(branch('**/*.md')
            .use(markdown())
        )
        // parse content
        .use(branch([
                '**/*',
                '!blog/**/*'
            ])
            .use(permalinks({
                relative: false
            }))
        )
        // parse blog
        .use(branch('blog/**/*')
            .use(dateInFilename())
            .use(function(files, metalsmith, done) {
                _.forEach(files, function(fileMeta, fileName){
                    fileMeta.template = 'post.html';// util.debug(util.inspect(fileMeta));
                });
                done();
            })
            .use(permalinks({
                pattern: 'blog/:date/:title',
                date: 'YYYY/MM',
                relative: false
            }))
        )
        // use templates
        .use(templates({
            engine: 'swig',
            directory: path.relative(config.paths.root, config.paths.templates)
        }))
        // put everything together...
        .build(function(err) {
            if (err) throw err;
        });
});
/* = Metalsmith rendering */


/**
 * + Watch Task
 * =====================================================================
 */
gulp.task('watch', function() {

    // show watch info in console
    logWatchInfo = function (event) {
        var eventPath = path.relative(config.paths.root, event.path),
            eventMessage = 'File ' + eventPath + ' was ' + event.type + ', running tasks...';
        console.log(eventMessage);
    }

    // watch site and and templates
    gulp.watch([
        'site/**/*',
        'templates/**/*'
    ], _.merge({cwd: config.paths.src}, config.watch), function(event) {
        logWatchInfo(event);
        gulp.start('render');
    });

    // watch stylus files in assets-dev
    gulp.watch([
        'stylus/**/*.styl'
    ], _.merge({cwd: config.paths.srcAssetsDev}, config.watch), function(event) {
        logWatchInfo(event);
        gulp.start('build-css');
    });

});
/* = Watch Task */


/**
 * + Clean Task
 * =====================================================================
 */
gulp.task('clean-web', function (cb) {
    del(config.paths.web, cb);
});
/* = Clean Task */

/**
 * + Full build
 * =====================================================================
 */
gulp.task('build', ['clean-web'], function() {
    gulp.start('render')
        .start('build-css')
});
/* = Full build */


/**
 * + Default task
 * =====================================================================
 */
gulp.task('default', function() {
    gulp.start('build');
});
/* = Default task */


/* = Gulpfile */
