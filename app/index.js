'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    appDir = 'app',
    destDir = 'dist',

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
                            projectDir = process.cwd();

                        fs.rename(projectDir + '/bower_components/normalize.css/normalize.css', projectDir + '/bower_components/normalize.css/_normalize.scss', function (err) {
                            if (err) throw err;
                        });

                        if (self.wordpress) {
                            performReplacement('Text Domain: _s', 'Text Domain: ' + self._.slugify(self.siteName), [appDir], '*.scss');
                            performReplacement("'_s'", "'" + self._.slugify(self.siteName) + "'", [appDir]);
                            performReplacement('_s_', self._.slugify(self.siteName).replace('-','_') + '_', [appDir]);
                            performReplacement(' _s', ' ' + self._.slugify(self.siteName).charAt(0).toUpperCase() + self._.slugify(self.siteName).slice(1), [appDir]);
                            performReplacement('_s-', self._.slugify(self.siteName) + '-', [appDir]);

                            fs.rename(projectDir + '/bower_components/modernizr/modernizr.js', projectDir + '/' + appDir + '/js/lib/modernizr.js', function (err) {
                                if (err) throw err;
                            });

                            fs.rename(projectDir + '/bower_components/jquery.customSelect/jquery.customSelect.js', projectDir + '/' + appDir + '/js/lib/jquery.customSelect.js', function (err) {
                                if (err) throw err;
                            });
                        } else {
                            fs.rename(projectDir + '/bower_components/modernizr/modernizr.js', projectDir + '/' + appDir + '/assets/js/lib/modernizr.js', function (err) {
                                if (err) throw err;
                            });

                            fs.rename(projectDir + '/bower_components/jquery-legacy/jquery.min.js', projectDir + '/' + appDir + '/assets/js/lib/jquery.min.js', function (err) {
                                if (err) throw err;
                            });

                            fs.rename(projectDir + '/bower_components/jquery.customSelect/jquery.customSelect.js', projectDir + '/' + appDir + '/assets/js/vendor/jquery.customSelect.js', function (err) {
                                if (err) throw err;
                            });
                        }


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
            name: 'docssa',
            message: 'Would you like to use DoCSSa CSS architecture?',
            default: true
        }, {
            name: 'localUrl',
            message: 'What is the local site URL?',
            default: function (props) {
                return 'http://dev.' + self._.slugify(props.siteName);
            },
            when: function (props) {
                return props.wordpress;
            }
        }, {
            name: 'dbName',
            message: 'What is the database name?',
            default: function (props) {
                return self._.slugify(props.siteName);
            },
            when: function (props) {
                return props.wordpress;
            }
        }, {
            name: 'dbUsername',
            message: 'What is the username for the database?',
            default: 'root',
            when: function (props) {
                return props.wordpress;
            }
        }, {
            name: 'dbPassword',
            message: 'What is the password for the database',
            default: 'root',
            when: function (props) {
                return props.wordpress;
            }
        }, {
            name: 'dbHost',
            message: 'What is the host for the database',
            default: 'localhost',
            when: function (props) {
                return props.wordpress;
            }
        }, {
            name: 'dbTablePrefix',
            message: 'What is the table prefix',
            default: 'wp_',
            when: function (props) {
                return props.wordpress;
            }
        }];

        this.prompt(prompts, function (props) {
            this.siteName = props.siteName;
            this.jekyll = props.jekyll;
            this.wordpress = props.wordpress;
            this.docssa = props.docssa;
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
            this.mkdir(destDir);
            this.directory('wordpress/core', destDir);
            this.copy('wordpress/_wp-config.php', destDir + '/wp-config.php');
            this.mkdir(destDir + '/wp-content/themes/' + this._.slugify(this.siteName));
            this.mkdir(appDir + '/fonts');
            this.directory('images', appDir + '/images');
            this.directory('js', appDir + '/js');
            this.mkdir(appDir + '/js/lib');
            this.mkdir(appDir + '/js/vendor');
            this.directory('wordpress/theme', appDir);

            if (this.docssa) {
                this.directory('docssa', appDir + '/sass');
                this.copy('sass/global/_variables.scss', appDir + '/sass/base/project/_variables.scss');
                this.copy('sass/local/_typography.scss', appDir + '/sass/base/project/_typography.scss');
                this.copy('sass/local/_images.scss', appDir + '/sass/base/project/_images.scss');
                this.copy('sass/local/_lists.scss', appDir + '/sass/base/project/_lists.scss');
                this.copy('sass/local/_forms.scss', appDir + '/sass/base/project/_forms.scss');
                this.copy('sass/local/_tables.scss', appDir + '/sass/base/project/_tables.scss');
            } else {
                this.directory('sass', appDir + '/sass');
            }
        } else {
            if(this.jekyll) {
                appDir = './';
                this.directory('jekyll', './');
                this.mkdir( '_data');
            } else {
                this.directory('html', appDir);
            }

            this.mkdir(appDir + '/assets');
            this.mkdir(appDir + '/assets/fonts');
            this.directory('images', appDir + '/assets/images');
            this.mkdir(appDir + '/assets/js/vendor');
            this.mkdir(appDir + '/assets/js/lib');

            this.directory('js', appDir + '/assets/js');

            if (this.docssa) {
                this.directory('docssa', appDir + '/assets/sass');
                this.copy('sass/global/_variables.scss', appDir + '/assets/sass/base/project/_variables.scss');
                this.copy('sass/local/_typography.scss', appDir + '/assets/sass/base/project/_typography.scss');
                this.copy('sass/local/_images.scss', appDir + '/assets/sass/base/project/_images.scss');
                this.copy('sass/local/_lists.scss', appDir + '/assets/sass/base/project/_lists.scss');
                this.copy('sass/local/_forms.scss', appDir + '/assets/sass/base/project/_forms.scss');
                this.copy('sass/local/_tables.scss', appDir + '/assets/sass/base/project/_tables.scss');
            } else {
                this.directory('sass', appDir + '/assets/sass');
            }
        }

        this.directory('originals', appDir + '/originals');
        this.mkdir(appDir + '/originals/_layout');
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