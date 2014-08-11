var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var svgSprites = require('gulp-svg-sprites');
var svg2png = require('gulp-svg2png');
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
var ecstatic = require('ecstatic');<% if (!wordpress) { %>
var insert = require('gulp-insert');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');<% } /* end not wp */ %>

/* sprite hack to get sprites as mq-friendly placeholders */
var svgSpritesCssRender = require('gulp-svg-sprites/lib/css-render'),
    svgSpritesUtils = require('gulp-svg-sprites/lib/utils'),
    svgSpritesCssUtils = require('gulp-svg-sprites/lib/css-utils');

svgSpritesCssRender.render = function(sprite, config) {
    var css = '';

    var data = sprite.elements.map(function (element) {
        var className = element.className = svgSpritesCssUtils.makeClassName(config.className, element.className, config);
        element.name = className.replace(".", "");

        // output a variable containing the width, height, offset, PNG, and SVG of this sprite
        css += '$' + element.name + ': ' +
            svgSpritesUtils.scaleValue(element.width) + 'px ' +
            svgSpritesUtils.scaleValue(element.height) + 'px ' +
            '-' + svgSpritesUtils.scaleValue(element.x) + 'px ' +
            '\'' + svgSpritesUtils.makePath(config.pngPath, svgSpritesUtils.swapFileName(sprite.path), config) + '\' ' +
            '\'' + svgSpritesUtils.makePath(config.svgPath, sprite.path, config) + '\';\n';

        return element;
    });

    // output the mixin required to render an actual sprite
    css +=
        '@mixin sprite-svg($sprite) {\n' +
            '$sprite-x: nth($sprite, 3);\n' +
            '$sprite-png: nth($sprite, 4);\n' +
            '$sprite-svg: nth($sprite, 5);\n' +

            'width: nth($sprite, 1);\n' +
            'height: nth($sprite, 2);\n' +

            'background-position: $sprite-x 0;\n' +
            'background-image: url(#{$sprite-svg});\n' +

            // background image changes if SVG is not supported
            '.no-svg & {\n' +
                'background-image: url(#{$sprite-png});\n' +
            '}\n' +
        '}';

    return {
        content: css,
        elements: data,
        svgFile: svgSpritesUtils.makePath(config.svgPath, sprite.path, config)
    };
}
/* end sprite hack */


var appRoute = '<% if (!jekyll) { %>app<% } else { %>.<% } %>',
    destRoute = '<% if (wpShared) { %>/Users/fisu/Sites/wordpress/wp-content/themes/<%= _.slugify(siteName) %><% } else { %>dist<% } %>',
    livereloadport = 35729,
    serverport = 5001;

var paths = {
    app: appRoute,
    html: appRoute + '/*{,*/*}.html',<% if (wordpress) { %>
    php: appRoute + '/*{,*/*}.php',<% } %>
    assets: appRoute + '<% if (!wordpress) { %>/assets<% } %>',
    sass: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/*{,*/*}.scss',
    fonts: appRoute + '/<% if (!wordpress) { %>assets/<% } %>fonts/**',
    jsAll: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/*{,*/*}.js',
    js: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/*.js',
    jsLib: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/lib/*.js',
    jsVendor: appRoute + '/assets/js/vendor/*.js',
    img: appRoute + '/<% if (!wordpress) { %>assets/<% } %>images/**/*',
    sprites: appRoute + '/<% if (!wordpress) { %>assets/<% } %>images/sprites/*.svg',
    spritesDir: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/project',
    dest: destRoute<% if (wordpress && !wpShared) { %> + '/wp-content/themes/<%= _.slugify(siteName) %>'<% } %>,
    destCSS: destRoute<% if (wordpress) { %><% if (!wpShared) { %> + '/wp-content/themes/<%= _.slugify(siteName) %>'<% } %><% } else { %> + '/assets/css'<% } %>,
    destFonts: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/fonts'<% } else { %>'/fonts'<% } %><% } else { %>'/assets/fonts'<% } %>,
    destJS: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/js'<% } else { %>'/js'<% } %><% } else { %>'/assets/js'<% } %>,
    destJSLib: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/js/lib'<% } else { %>'/js/lib'<% } %><% } else { %>'/assets/js/lib'<% } %>,
    destImg: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/images'<% } else { %>'/images'<% } %><% } else { %>'/assets/images'<% } %>
};

var spriteConfig = {
    className: ".sprite--%f",
    cssFile: "_sprites.scss",
    <% if (!wordpress) { %>svgPath: "%f",
    pngPath: "%f",<% } else { /* is wp */ %>svgPath: "images/svg-sprite.svg",
    pngPath: "images/png-sprite.png",
    <% } %>
    svg: {
        sprite: "../../..<% if (!wordpress) { %>/../assets<% } %>/images/svg-sprite.svg"
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
        .pipe(insert.wrap('(function (window, document, $, undefined) {', '})(window, document, jQuery);'))
        .pipe(gulp.dest(paths.destJS));
});


<% } %>gulp.task('libScripts', function () {
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


gulp.task('sprites', function () {
    return gulp.src(paths.sprites)
        .pipe(newer(paths.spritesDir))
        .pipe(svg(spriteConfig))
        .pipe(gulp.dest(paths.spritesDir))
        .pipe(png())
});


gulp.task('toPng', function () {
    gulp.src([paths.assets + '/images/**/*.svg', '!' + paths.assets + '/images/svg-sprite.svg', '!' + paths.assets + '/images/sprites/**'])
        .pipe(svg2png())
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(paths.destImg));
});


gulp.task('images', ['toPng'], function () {
    return gulp.src([paths.img, '!' + paths.app + '/**/images/sprites{,/**}'])
        .pipe(newer(paths.destImg))
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(paths.destImg))
        .pipe(refresh(lrserver));
});


<% if (!jekyll) { %>gulp.task('clean', require('del').bind(null, ['.tmp', paths.dest]<% if (wpShared) { %>, {force: true}<% } %>));


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


gulp.task('filesCopy', function () {
    gulp.src([paths.app + '/backgroundsize.min.htc'])
        .pipe(gulp.dest(paths.dest));
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

gulp.task('build', ['scripts', 'sprites', 'styles', 'images', 'fonts', <% if (wordpress) { %>'php', <% } else if (!jekyll) { %>'html', <% } %><% if (jekyll) { %>'jekyll',<% } %>'filesCopy']);

gulp.task('server', ['build'], function () {
    gulp.start('serve');
    gulp.start('watch');
});

gulp.task('default', <% if (!jekyll) { %>['clean'],<% } %> function () {
    gulp.start('server');
});