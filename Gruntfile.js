module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        appFolder: 'src/',
        distFolder: 'dist/',

        clean: {
            build: {
                nonull: false,
                src: ['<%= distFolder %>']
            }
        },

        concat: {
            options: {
                    // define a string to put between each file in the concatenated output
                separator: ';'
            },

            dist: {
                // the files to concatenate
                src: ['<%= appFolder %>*.js'],
                // the location of the resulting JS file
                dest: '<%= distFolder %><%= pkg.name %>.js'
            }
        },

        jshint: {
            files: ['<%= appFolder %>*.js'],
            options: {
                maxerr: 10,
                // unused: true,
                eqnull: true,
                eqeqeq: true,
                jquery: true
            }
        },

        uglify: {
            my_target: {
                options: {
                    mangle: false
                },

                files: {
                    '<%= distFolder %><%= pkg.name %>.min.js': ['<%= distFolder %><%= pkg.name %>.js']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['clean:build', 'jshint', 'concat', 'uglify'])

};