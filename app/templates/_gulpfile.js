var http = require('http');
var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var bourbon = require('node-bourbon').includePaths;
var clean = require('gulp-clean');
var refresh = require('gulp-livereload');
var rename = require('gulp-rename');
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
    js: 'app/assets/js/*.js',
    img: 'app/assets/images/**',
    dest: 'dist',
    destJS: 'dist/assets/js',
    destCSS: 'dist/assets/css',
    destImg: 'dist/assets/images'
};

var jsDepsToMove = [
    './bower_components/jquery-legacy/jquery.min.js',
    './bower_components/modernizr/modernizr.js'
];

gulp.task('scripts', function () {
    return gulp.src([paths.js])
        .pipe(concat('script.js'))
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

gulp.task('clean', function () {
    return gulp.src(['.tmp', paths.dest], { read: false }).pipe(clean());
});

gulp.task('moveJs', function () {
    gulp.src(jsDepsToMove)
    .pipe(gulp.dest(paths.destJS + '/libs'));
});

gulp.task('cssToSass', ['move'], function () {
    gulp.src('./bower_components/normalize.css/normalize.css')
    .pipe(rename('_normalize.scss'))
    .pipe(gulp.dest('./bower_components/normalize.css'));
});

gulp.task('move', [], function () {
    gulp.start('moveJs');
});

gulp.task('serve', function () {
    http.createServer(ecstatic({ root: __dirname + '/' + paths.dest })).listen(serverport);
    require('opn')('http://localhost:' + serverport);
    lrserver.listen(livereloadport);
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});

gulp.task('images', function () {
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

gulp.task('build', ['cssToSass', 'scripts', 'styles', 'html', 'images', 'serve', 'watch']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});