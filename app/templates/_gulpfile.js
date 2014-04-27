var http = require('http');
var gulp = require('gulp');
/*var browserify = require('gulp-browserify');*/
var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var bourbon = require('node-bourbon').includePaths;
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var lrserver = lr();
var minifyCSS = require('gulp-minify-css');
var embedlr = require('gulp-embedlr');
var ecstatic = require('ecstatic');
var imagemin = require('gulp-imagemin');

var livereloadport = 35729,
    serverport = 5001;

var paths = {
    app: 'app',
    html: 'app/**/*.html',
    assets: 'app/assets',
    sass: 'app/assets/sass/**/*.scss',
    js: 'app/assets/js/**/*.js',
    img: 'app/assets/img/**',
    dest: 'dist',
    destJS: 'dist/assets/js',
    destCSS: 'dist/assets/css',
    destImg: 'dist/assets/img'
};

gulp.task('scripts', function() {
    return gulp.src([paths.js])
        /*.pipe(browserify())*/
        .pipe(concat('dest.js'))
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});

gulp.task('styles', function () {
    return gulp.src(paths.sass)
        .pipe(sass({
            loadPath: ['styles'].concat(bourbon)
        }
        ))
        .pipe(gulp.dest(paths.destCSS))
        .pipe(refresh(lrserver));
});

gulp.task('serve', function() {
  http.createServer(ecstatic({ root: __dirname + '/' + paths.dest })).listen(serverport);
  require('opn')('http://localhost:' + serverport);
  lrserver.listen(livereloadport);
});

gulp.task('html', function() {
    return gulp.src(paths.html)
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});

gulp.task('images', function() {
    return gulp.src(paths.img)
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest(paths.destImg))
        .pipe(refresh(lrserver));
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.sass, ['styles']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.img, ['images']);
});

gulp.task('default', ['scripts', 'styles', 'html', 'images', 'serve', 'watch']);