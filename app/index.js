'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    appDir = 'app/',
    destDir = 'dist/',
    isWpShared = false,

    GulpJackGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');

        this.on('end', function () {
            var self = this;
            if (!this.options['skip-install']) {
                this.installDependencies({
                    callback: function () {
                        function performReplacement(regex, replacement, paths, include) {
                            var replace = require('replace');

                            console.log('Replacing ' + regex + ' for ' + replacement);
                            replace({
                                regex: regex,
                                replacement: replacement,
                                paths: paths,
                                include: include,
                                recursive: true,
                                count: true
                            });
                        }

                        var fs = require('fs'),
                            projectDir = process.cwd() + '/',
                            assetsDir = self.wordpress ? '' : 'assets/';

                        function moveFile(origLocation, newLocation, callback) {
                            fs.rename(projectDir + origLocation, projectDir + newLocation, function (err) {
                                if (err) throw err;
                                if (callback) callback();
                            });
                        }

                        moveFile('bower_components/normalize.css/normalize.css', 'bower_components/normalize.css/_normalize.scss');


                        if (self.wordpress) {
                            assetsDir = '';
                            performReplacement('Text Domain: _s', 'Text Domain: ' + self._.slugify(self.siteName), [appDir], '*.scss');
                            performReplacement("'_s'", "'" + self._.slugify(self.siteName) + "'", [appDir]);
                            performReplacement('_s_', self._.slugify(self.siteName).replace('-','_') + '_', [appDir]);
                            performReplacement(' _s', ' ' + self._.slugify(self.siteName).charAt(0).toUpperCase() + self._.slugify(self.siteName).slice(1), [appDir]);
                            performReplacement('_s-', self._.slugify(self.siteName) + '-', [appDir]);

                            if (!isWpShared) {
                                moveFile('bower_components/background-size-polyfill/backgroundsize.min.htc', destDir + 'backgroundsize.min.htc');
                            }

                            moveFile('bower_components/jquery.customSelect/jquery.customSelect.js', appDir + 'js/lib/jquery.customSelect.js');
                            moveFile('bower_components/picturefill/dist/picturefill.min.js', appDir + 'js/lib/picturefill.min.js');

                            if (!self.browserify) {
                                moveFile('bower_components/parsleyjs/dist/parsley.min.js', appDir + 'js/lib/parsley.min.js');
                            }

                            fs.unlink(projectDir + appDir + 'sass/live.scss', function (err) {
                                if (err) throw err;
                            });


                        } else {

                            moveFile('bower_components/background-size-polyfill/backgroundsize.min.htc', appDir + 'backgroundsize.min.htc');
                            moveFile(appDir + assetsDir + 'sass/live.scss', appDir + assetsDir + 'sass/' + self._.slugify(self.siteName) + '.scss');
                            moveFile('bower_components/picturefill/dist/picturefill.min.js', appDir + assetsDir + 'js/lib/picturefill.min.js');

                            if (!self.browserify) {
                                moveFile('bower_components/parsleyjs/dist/parsley.js', appDir + assetsDir + 'js/vendor/parsley.js');
                                moveFile(appDir + assetsDir + 'js/lib/parsleyfi.js', appDir + assetsDir + 'js/vendor/parsleyfi.js');
                                moveFile('bower_components/jquery-legacy/dist/jquery.min.js', appDir + assetsDir + 'js/lib/jquery.min.js');
                                moveFile('bower_components/jquery.customSelect/jquery.customSelect.js', appDir + assetsDir + 'js/vendor/jquery.customSelect.js');
                            } else {
                                moveFile('bower_components/jquery.customSelect/jquery.customSelect.js', appDir + assetsDir + 'js/lib/jquery.customSelect.js');
                                moveFile(appDir + assetsDir + 'js/lib/parsleyfi.js', appDir + assetsDir + 'js/lib/parsleyfi.js');
                            }
                        }

                        if (self.bootstrap) {

                            moveFile('bower_components/bootstrap-sass-official/assets/stylesheets/bootstrap', appDir + assetsDir + 'sass/lib/bootstrap', function() {
                                moveFile('bower_components/bootstrap-sass-official/assets/stylesheets/_bootstrap.scss', appDir + assetsDir + 'sass/lib/_bootstrap.scss');
                                fs.readFile(projectDir + appDir + assetsDir + 'sass/lib/bootstrap/_glyphicons.scss', 'utf8', function (err,data) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    var result = data.replace(/\$icon-font-path}/g, '$font-dir}/');

                                    fs.writeFile(projectDir + appDir + assetsDir + 'sass/lib/bootstrap/_glyphicons.scss', result, 'utf8', function (err) {
                                        if (err) return console.log(err);
                                    });
                                });
                            });

                            moveFile('bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js', appDir + assetsDir + 'js/lib/bootstrap.js');
                            moveFile('bower_components/bootstrap-sass-official/assets/fonts/bootstrap', appDir + assetsDir + 'fonts');
                        }

                        if (self.verticalRhythm) {
                            moveFile('bower_components/knife/_knife.sass', appDir + assetsDir + 'sass/project/_vertical-rhythm.sass');
                        }

                        moveFile('bower_components/respond/dest/respond.min.js', appDir + assetsDir + 'js/lib/respond.min.js');
                        moveFile('bower_components/selectivizr/selectivizr.js', appDir + assetsDir + 'js/lib/selectivizr.js');
                    }
                });
            }
        });
    },

    askFor: function () {
        var done = this.async(),
            self = this;

        // have Yeoman greet the user
        this.log(this.yeoman);

        // replace it with a short and sweet description of your generator
        this.log(chalk.magenta('You\'re using the fantastic GulpJack generator.'));

        var prompts = [{
            name: 'siteName',
            message: 'What would you like to call your site?'
        }, {
            type: 'confirm',
            name: 'wordpress',
            message: 'Is this site going to be running on WordPress?',
            default: false
        }, {
            type: 'confirm',
            name: 'jekyll',
            message: 'Would you like to use Jekyll templating?',
            default: false,
            when: function (props) {
                return !props.wordpress;
            }
        }, {
            type: 'confirm',
            name: 'bootstrap',
            message: 'Would you like to use Bootstrap?',
            default: false
        }, {
            type: 'confirm',
            name: 'verticalRhythm',
            message: 'Would you like to implement vertical rhythm?',
            default: true
        }, {
            type: 'confirm',
            name: 'browserify',
            message: 'Would you like to use Browserify for JS',
            default: true
        }, {
            type: 'confirm',
            name: 'wpShared',
            message: 'Is the theme to be served from the shared WordPress directory?',
            default: true,
            when: function (props) {
                return props.wordpress;
            }
        }, {
            name: 'localUrl',
            message: 'What is the local site URL?',
            default: function (props) {
                return 'http://dev.' + self._.slugify(props.siteName);
            },
            when: function (props) {
                return props.wordpress && !props.wpShared;
            }
        }, {
            name: 'dbName',
            message: 'What is the database name?',
            default: function (props) {
                return self._.slugify(props.siteName);
            },
            when: function (props) {
                return props.wordpress && !props.wpShared;
            }
        }, {
            name: 'dbUsername',
            message: 'What is the username for the database?',
            default: 'root',
            when: function (props) {
                return props.wordpress && !props.wpShared;
            }
        }, {
            name: 'dbPassword',
            message: 'What is the password for the database',
            default: 'root',
            when: function (props) {
                return props.wordpress && !props.wpShared;
            }
        }, {
            name: 'dbHost',
            message: 'What is the host for the database',
            default: 'localhost',
            when: function (props) {
                return props.wordpress && !props.wpShared;
            }
        }, {
            name: 'dbTablePrefix',
            message: 'What is the table prefix',
            default: 'wp_',
            when: function (props) {
                return props.wordpress && !props.wpShared;
            }
        }];

        this.prompt(prompts, function (props) {
            this.siteName = props.siteName;
            this.wordpress = props.wordpress;
            this.jekyll = props.jekyll;
            this.bootstrap = props.bootstrap;
            this.verticalRhythm = props.verticalRhythm;
            this.browserify = props.browserify;
            this.wpShared = props.wpShared;
            this.localUrl = props.localUrl;
            this.dbName = props.dbName;
            this.dbUsername = props.dbUsername;
            this.dbPassword = props.dbPassword;
            this.dbHost = props.dbHost;
            this.dbTablePrefix = props.dbTablePrefix;

            done();
        }.bind(this));
    },

    app: function () {
        if (this.wordpress) {
            if(this.wpShared) {
                isWpShared = true;
                destDir = '/Users/fisu/Sites/wordpress/wp-content/themes/' + this._.slugify(this.siteName);
            } else {
                this.mkdir(destDir);
                this.directory('wordpress/core', destDir);
                this.copy('wordpress/_wp-config.php', destDir + 'wp-config.php');
                this.mkdir(destDir + 'wp-content/themes/' + this._.slugify(this.siteName));
            }

            this.mkdir(appDir + 'fonts');
            this.directory('images', appDir + 'images');
            this.copy('js/script.js', appDir + 'js/script.js');
            this.directory('js/lib', appDir + 'js/lib');
            this.directory('js/vendor', appDir + 'js/lib');
            this.directory('wordpress/theme', appDir);
            this.directory('sass', appDir + 'sass');

        } else {
            if(this.jekyll) {
                appDir = './';
                this.directory('jekyll', './');
                this.mkdir( '_data');
            } else {
                this.directory('html', appDir);
            }

            this.mkdir(appDir + 'assets');
            this.mkdir(appDir + 'assets/fonts');
            this.directory('images', appDir + 'assets/images');

            if (this.browserify) {
                this.copy('js/script.js', appDir + 'assets/js/script.js');
                this.directory('js/lib', appDir + 'assets/js/lib');
                this.copy('js/vendor/jquery.smartresize.js', appDir + 'assets/js/lib/jquery.smartresize.js');
            } else {
                this.directory('js', appDir + 'assets/js');
            }

            this.directory('sass', appDir + 'assets/sass');
        }

        this.directory('project_assets', 'project_assets');
        this.mkdir('project_assets/_layout');
        this.mkdir('project_assets/_cut');
        this.copy('_sprite-mixin.scss', 'templates/_sprite-mixin.scss');
        this.copy('_package.json', 'package.json');
        this.copy('_bower.json', 'bower.json');
        this.copy('_gitignore.txt', '.gitignore');
        this.template('_gulpfile.js', 'gulpfile.js');
    },

    projectfiles: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('jshintrc', '.jshintrc');
    }
});

module.exports = GulpJackGenerator;