'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var appDir = 'app';


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
      }];

    this.prompt(prompts, function (props) {
      this.siteName = props.siteName;

      done();
    }.bind(this));
  },

  app: function () {
    this.mkdir(appDir + '/assets');
    this.mkdir(appDir + '/assets/images');
    this.mkdir(appDir + '/assets/js/vendor');

    this.directory('html', appDir);
    this.directory('js', appDir + '/assets/js');
    this.directory('sass', appDir + '/assets/sass');

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