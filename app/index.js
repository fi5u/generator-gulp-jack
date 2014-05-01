'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var appDir = 'app';
var destDir = 'dist';


var GulpJackGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');

        this.on('end', function () {
            if (!this.options['skip-install']) {
                this.installDependencies();
            }
        });
    },

    askFor: function () {
        var done = this.async();

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
            name: 'dbName',
            message: 'What is the database name?',
            default: 'wordpress',
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
            this.wordpress = props.wordpress;
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
            this.mkdir(appDir + '/images');
            this.directory('wordpress/theme', appDir);
            this.directory('sass', appDir + '/sass');
        } else {
            this.mkdir(appDir + '/assets');
            this.mkdir(appDir + '/assets/images');
            this.mkdir(appDir + '/assets/js/vendor');

            this.directory('html', appDir);
            this.directory('js', appDir + '/assets/js');
            this.directory('sass', appDir + '/assets/sass');
        }

        this.copy('_package.json', 'package.json');
        this.copy('_bower.json', 'bower.json');
        this.copy('_gulpfile.js', 'gulpfile.js');
    },

    projectfiles: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('jshintrc', '.jshintrc');
    }
});

module.exports = GulpJackGenerator;