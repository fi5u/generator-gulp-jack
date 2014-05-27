var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var bourbon = require('node-bourbon').includePaths;
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var http = require('http');
var lr = require('tiny-lr');
var lrserver = lr();
var refresh = require('gulp-livereload');
var embedlr = require('gulp-embedlr');
var ecstatic = require('ecstatic');<% if (jekyll) { %>
var watch = require('gulp-watch');<% } else { /* not jekyll */ %>
var clean = require('gulp-clean');<% } /* end not jekyll */ %><% if (!wordpress) { %>
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');<% } /* end not wp */ %>

var appRoute = '<% if (!jekyll) { %>app<% } else { %>.<% } %>',
    destRoute = 'dist',
    livereloadport = 35729,
    serverport = 5001;

var paths = {<% if (!wordpress) { %><% if (jekyll) { %>
    app: appRoute,
    html: appRoute + '/index.html',
    assets: appRoute + '/assets',
    sass: appRoute + '/assets/sass/**/*.scss',
    jsAll: appRoute + '/assets/js/**/*.js',
    js: appRoute + '/assets/js/*.js',
    jsVendor: appRoute + '/assets/js/vendor/*.js',
    img: appRoute + '/assets/images/**',
    dest: destRoute,
    destJS: destRoute + '/assets/js',
    destJSLib: destRoute + '/assets/js/lib',
    destCSS: destRoute + '/assets/css',
    destImg: destRoute + '/assets/images'<% /* end not wp && is jekyll */ } else { /* not wp &&  not jekyll */ %>
    app: appRoute,
    html: appRoute + '/**/*.html',
    assets: appRoute + '/assets',
    sass: appRoute + '/assets/sass/**/*.scss',
    jsAll: appRoute + '/assets/js/**/*.js',
    js: appRoute + '/assets/js/*.js',
    jsVendor: appRoute + '/assets/js/vendor/*.js',
    img: appRoute + '/assets/images/**',
    dest: destRoute,
    destJS: destRoute + '/assets/js',
    destJSLib: destRoute + '/assets/js/lib',
    destCSS: destRoute + '/assets/css',
    destImg: destRoute + '/assets/images'<% } /* end not wp && not jekyll */ %><% } else { /* is wp */ %>
    php: appRoute + '/**/*.php',
    sass: appRoute + '/sass/**/*.scss',
    jsAll: appRoute + '/js/**/*.js',
    js: appRoute + '/js/**/*.js',
    img: appRoute + '/images/**',
    dest: destRoute + '/wp-content/themes/<%= _.slugify(siteName) %>',
    destJS: destRoute + '/wp-content/themes/<%= _.slugify(siteName) %>/js',
    destJSLib: destRoute + '/wp-content/themes/<%= _.slugify(siteName) %>/js/lib',
    destCSS: destRoute + '/wp-content/themes/<%= _.slugify(siteName) %>',
    destImg: destRoute + '/wp-content/themes/<%= _.slugify(siteName) %>/images'<% } /* end is wp */ %>
};


<% if (!wordpress) { %>gulp.task('vendorScripts', function () {
    return gulp.src([paths.jsVendor])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.destJS));
});<% } %>


gulp.task('libScripts', function () {
    return gulp.src([paths.jsLib])
        .pipe(gulp.dest(paths.destJSLib));
});


gulp.task('scripts', [<% if (!wordpress) { %>'vendorScripts', <% } %>'libScripts'], function () {
    return gulp.src([paths.js])<% if (!wordpress) { %>
        .pipe(concat('script.js'))<% } %>
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});


gulp.task('styles', function () {
    return gulp.src(paths.sass)
        .pipe(sass({
        loadPath: require('node-bourbon').includePaths
    }
    ))
    .pipe(gulp.dest(paths.destCSS))
    .pipe(refresh(lrserver));
});


<% if (!jekyll) { %>gulp.task('clean', function () {
    return gulp.src(['.tmp', paths.dest], { read: false }).pipe(clean());
});


<% } /* end not jekyll */ %>gulp.task('serve', function () {
    http.createServer(ecstatic({ root: __dirname + '/' + paths.dest })).listen(serverport);<% if (!wordpress) { %>
    require('opn')('http://localhost:' + serverport + '/index.html');<% } /* end not wp */ else { /* is wp */ %>require('opn')('<%= localUrl %>');<% } /* end is wp */ %>
    lrserver.listen(livereloadport);
});
<% if (wordpress) { %>

gulp.task('php', function () {
    return gulp.src(paths.php)
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});<% } /* end is wp */ else { /* not wp */ %><% if (!jekyll) { /* not wp && not jekyll */ %>gulp.task('html', function () {
    return gulp.src([paths.html, '!' + paths.app + '/assets/sass/**/*.html'])
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});<% } /* end not wp && not jekyll */ %><% } /* end not wp */ %>


gulp.task('images', function () {
    return gulp.src(paths.img)
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest(paths.destImg))
        .pipe(refresh(lrserver));
});


gulp.task('watch', function () {
    gulp.watch(paths.jsAll, ['scripts']);
    gulp.watch(paths.sass, ['styles']);<% if (!jekyll && !wordpress) { %>
    gulp.watch(paths.html, ['html']);
    <% } %>gulp.watch(paths.img, ['images']);<% if (wordpress) { %>
    gulp.watch(paths.php, ['php']);<% } %>
});


<% if (jekyll) { %>gulp.task('jekyll', function() {
    var spawn = require('child_process').spawn,
    j = spawn('jekyll', ['-w', 'build']);

    j.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    watch({glob: paths.destRoute + '/**'}, function(files) {
        return files.pipe(refresh(lrserver));
    });

    gulp.start('build');
});<% } %>


gulp.task('build', ['scripts', 'styles',<% if (wordpress) { %>'php',<% } else if (!jekyll) { %>'html',<% } %> 'images', 'serve', 'watch']);


gulp.task('default', <% if (!jekyll) { %>['clean'], <% } %>function () {
    <% if (jekyll) { %>gulp.start('jekyll');<% } else { %>gulp.start('build');<% } %>
});