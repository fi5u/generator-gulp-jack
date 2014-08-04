'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var appDir = 'app';

var ComponentGenerator = yeoman.generators.NamedBase.extend({
    init: function () {
        console.log('You called the component subgenerator with the argument ' + this.name + '.');
    },

    files: function () {
        this.directory('component', appDir + '/sass/components/' + this._.slugify(this.name));
    },

    rename: function () {
        fs.rename(appDir + '/sass/components/' + this._.slugify(this.name) + '/_component.scss', appDir + '/sass/components/' + this._.slugify(this.name) + '/_' + this._.slugify(this.name) + '.scss', function (err) {
            if (err) throw err;
        });

        fs.rename(appDir + '/sass/components/' + this._.slugify(this.name) + '/component.standalone.html', appDir + '/sass/components/' + this._.slugify(this.name) + '/' + this._.slugify(this.name) + '.standalone.html', function (err) {
            if (err) throw err;
        });

        fs.rename(appDir + '/sass/components/' + this._.slugify(this.name) + '/component.standalone.scss', appDir + '/sass/components/' + this._.slugify(this.name) + '/' + this._.slugify(this.name) + '.standalone.scss', function (err) {
            if (err) throw err;
        });

        fs.appendFile(appDir + '/sass/components/__components.scss', '@import "' + this._.slugify(this.name) + '/_' + this._.slugify(this.name) + '";\n@import "' + this._.slugify(this.name) + '/_skins/_custom";', function (err) {
            if (err) throw err;
        });
    }
});

module.exports = ComponentGenerator;