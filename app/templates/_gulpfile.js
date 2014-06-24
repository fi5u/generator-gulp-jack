var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var bourbon = require('node-bourbon').includePaths;
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var svgSprites = require('gulp-svg-sprites');
var svg = svgSprites.svg;
var png = svgSprites.png;
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var newer = require('gulp-newer');
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

var paths = {
    app: appRoute,
    html: appRoute + '/*{,*/*}.html',<% if (wordpress) { %>
    php: appRoute + '/*{,*/*}.php',<% } %>
    assets: appRoute + '/assets',
    sass: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/*{,*/*}.scss',
    fonts: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/fonts/**',
    jsAll: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/*{,*/*}.js',
    js: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/*.js',
    jsLib: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/lib/*.js',
    jsVendor: appRoute + '/assets/js/vendor/*.js',
    img: appRoute + '/<% if (!wordpress) { %>assets/<% } %>images/**',
    sprites: appRoute + '/<% if (!wordpress) { %>assets/<% } %>images/sprites/*.svg',
    spritesDir: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/<% if (docssa) { %>base/project<% } else { %>local<% } %>',
    dest: destRoute<% if (wordpress) { %> + '/wp-content/themes/<%= _.slugify(siteName) %>'<% } %>,
    destCSS: destRoute + <% if (wordpress) { %>'/wp-content/themes/<%= _.slugify(siteName) %>'<% } else { %>'/assets/css'<% } %>,
    destFonts: destRoute + <% if (wordpress) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/fonts'<% } else { %>'/assets/css/fonts'<% } %>,
    destJS: destRoute + <% if (wordpress) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/js'<% } else { %>'/assets/js'<% } %>,
    destJSLib: destRoute + <% if (wordpress) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/js/lib'<% } else { %>'/assets/js/lib'<% } %>,
    destImg: destRoute + <% if (wordpress) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/images'<% } else { %>'/assets/images'<% } %>
};

var spriteConfig = {
    className: ".sprite--%f",
    cssFile: "_sprites.scss",
    <% if (!wordpress) { %>svgPath: "%f",
    pngPath: "%f",<% } else { /* is wp */ %>svgPath: "images/svg-sprite.svg",
    pngPath: "images/png-sprite.png",
    <% } %>
    svg: {<% if (docssa) { %>
        sprite: "../../..<% if (!wordpress) { %>/../assets<% } %>/images/svg-sprite.svg"<% } else { /* not docssa */ %>
        sprite: "../..<% if (!wordpress) { %>/../assets<% } %>/images/svg-sprite.svg"<% } %>
    },
    generatePreview: false
};

var onError = function (err) {
    gutil.beep();
    console.log(err);
};

<% if (!wordpress) { %>gulp.task('vendorScripts', function () {
    return gulp.src([paths.jsVendor])
        .pipe(newer(paths.destJS + '/vendor.js'))
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
        .pipe(newer(paths.destJS + '/script.js'))
        .pipe(concat('script.js'))<% } %>
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});


gulp.task('styles', function () {
    return gulp.src(paths.sass)
        .pipe(plumber(onError))
        .pipe(sass({loadPath: require('node-bourbon').includePaths}))
        .pipe(gulp.dest(paths.destCSS))
        .pipe(refresh(lrserver));
});


gulp.task('fonts', function () {
    return gulp.src([paths.fonts])
        .pipe(gulp.dest(paths.destFonts));
});


<% if (!jekyll) { %>gulp.task('clean', function () {
    return gulp.src(['.tmp', paths.dest], { read: false }).pipe(clean());
});


<% } /* end not jekyll */ %>gulp.task('serve', function () {
    http.createServer(ecstatic({ root: __dirname + '/' + paths.dest })).listen(serverport);<% if (!wordpress) { %>
    require('opn')('http://localhost:' + serverport + '/index.html');<% } /* end not wp */ else { /* is wp */ %>require('opn')('<%= localUrl %>');<% } /* end is wp */ %>
    lrserver.listen(livereloadport);
});

<% if (jekyll) { %>gulp.task('jekyll', function () {
    var spawn = require('child_process').spawn,
        jekyll = spawn('jekyll', ['build']);

    jekyll.on('exit', function (code) {
        console.log('-- Finished Jekyll Build --')
    })
});<% } %><% if (wordpress) { %>gulp.task('php', function () {
    return gulp.src(paths.php)
        .pipe(newer(paths.dest))
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});<% } /* end is wp */ else { /* not wp */ %><% if (!jekyll) { /* not wp && not jekyll */ %>gulp.task('html', function () {
    return gulp.src([paths.html, '!' + paths.app + '/assets/sass/**/*.html'])
        .pipe(newer(paths.dest))
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});<% } /* end not wp && not jekyll */ %><% } /* end not wp */ %>


gulp.task('sprites', function () {
    return gulp.src(paths.sprites)
        .pipe(newer(paths.spritesDir))
        .pipe(svg(spriteConfig))
        .pipe(gulp.dest(paths.spritesDir))
        .pipe(png())
});


gulp.task('images', function () {
    return gulp.src([paths.img, '!' + paths.app + '/**/images/sprites{,/**}'])
        .pipe(newer(paths.destImg))
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest(paths.destImg))
        .pipe(refresh(lrserver));
});


gulp.task('watch', function () {
    gulp.watch(paths.jsAll, ['scripts']);
    gulp.watch(paths.sass, ['styles']);
    <% if (!jekyll && !wordpress) { %>gulp.watch(paths.html, ['html']);
    <% } %>gulp.watch([paths.img, '!' + paths.app + '/**/images/sprites{,/**}'], ['images']);
    gulp.watch(paths.sprites, ['sprites']);<% if (wordpress) { %>
    gulp.watch(paths.php, ['php']);<% } %><% if (jekyll) { %>
    gulp.watch([paths.html, './**/*.yml', '!./dist/**', '!./dist/*/**'], ['jekyll']);

    gulp.watch([paths.dest + '/**/*.html']).on('change', function (file) {
        return gulp.src(paths.dest)
            .pipe(refresh(lrserver));
    });
    <% } %>
});


gulp.task('default', [<% if (!jekyll) { %>'clean', <% } %>'scripts', 'sprites', 'styles', 'images', 'fonts', <% if (wordpress) { %>'php', <% } else if (!jekyll) { %>'html', <% } %><% if (jekyll) { %>'jekyll',<% } %> 'serve', 'watch']);