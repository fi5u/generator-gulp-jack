var gulp = require('gulp'),
    clean = require('gulp-clean'),
    sass = require('gulp-ruby-sass'),
    bourbon = require('node-bourbon').includePaths,
    minifyCSS = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    http = require('http'),
    lr = require('tiny-lr'),
    lrserver = lr(),
    refresh = require('gulp-livereload'),
    embedlr = require('gulp-embedlr'),
    ecstatic = require('ecstatic');
<% if (!wordpress) { %>
var uglify = require('gulp-uglify'),
    concat = require('gulp-concat');
<% } %>

var livereloadport = 35729,
    serverport = 5001;

<% if (!wordpress) { %>
var paths = {
    app: 'app',
    html: 'app/**/*.html',
    assets: 'app/assets',
    sass: 'app/assets/sass/**/*.scss',
    js: 'app/assets/js/*.js',
    jsVendor: 'app/assets/js/vendor/*.js',
    img: 'app/assets/images/**',
    dest: 'dist',
    destJS: 'dist/assets/js',
    destCSS: 'dist/assets/css',
    destImg: 'dist/assets/images'
};
<% } %>

<% if (wordpress) { %>
var paths = {
    php: 'app/**/*.php',
    sass: 'app/sass/**/*.scss',
    js: 'app/js/**/*.js',
    img: 'app/images/**',
    dest: 'dist/wp-content/themes/<%= _.slugify(siteName) %>',
    destJS: 'dist/wp-content/themes/<%= _.slugify(siteName) %>/js',
    destCSS: 'dist/wp-content/themes/<%= _.slugify(siteName) %>',
    destImg: 'dist/wp-content/themes/<%= _.slugify(siteName) %>/images'
};
<% } %>

<% if (wordpress) { %>
gulp.task('scripts', function () {
    return gulp.src([paths.js])
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});
<% } %>
<% if (!wordpress) { %>
gulp.task('vendorScripts', function () {
    return gulp.src([paths.jsVendor])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});

gulp.task('scripts', ['vendorScripts'], function () {
    return gulp.src([paths.js])
        .pipe(concat('script.js'))
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});
<% } %>

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

gulp.task('serve', function () {
    http.createServer(ecstatic({ root: __dirname + '/' + paths.dest })).listen(serverport);
    <% if (!wordpress) { %>
    require('opn')('http://localhost:' + serverport);
    <% } else { %>
    require('opn')('<%= localUrl %>');
    <% } %>
    lrserver.listen(livereloadport);
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});

<% if (wordpress) { %>
gulp.task('php', function () {
    return gulp.src(paths.php)
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});
<% } %>

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
    <% if (wordpress) { %>
    gulp.watch(paths.php, ['php']);
    <% } %>
});

<% if (wordpress) { %>
gulp.task('build', ['scripts', 'styles', 'php', 'images', 'serve', 'watch']);
<% } %>
<% if (!wordpress) { %>
gulp.task('build', ['scripts', 'styles', 'html', 'images', 'serve', 'watch']);
<% } %>

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});