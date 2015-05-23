module.exports = function(grunt) {
    'use strict';

    // Load all grunt tasks matching the `grunt-*` pattern.
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Configure all tasks.
        jshint: {
            all: 'check.js',
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            }
        },
        jscs: {
            src: 'check.js',
            options: {
                config: '.jscsrc'
            }
        }
    });

    // Register Grunt tasks.
    grunt.registerTask('default', ['jshint', 'jscs']);
};
