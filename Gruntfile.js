module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        appFolder: 'src/',
        distFolder: 'dist/',

        copy: {
            build: {
                cwd: '<%= appFolder %>',
                src: [ '**', '!**/partials/**/*', '!**/coffee/**/*'],
                dest: '<%= distFolder %>',
                expand: true
            }
        }, 

        clean: {
            build: {
                nonull: false,
                src: ['<%= distFolder %>']
            },

            scripts: {
                nonull: false,
                src: ['<%= distFolder %>js']        
            },

            postbuild: {
                nonull: false,
                src: ['<%= distFolder %>**/*.coffee','<%= distFolder %>coffee-compiled','<%= distFolder %>assets']
            }
        },

        coffee: {
            glob_to_multiple: {
                expand: true,
                flatten: true,
                cwd: '<%= appFolder %>',
                src: ['**/*.coffee'],
                dest: '<%= distFolder %>',
                ext: '.js'
            }  
        },

        // concat: {
        //     options: {
        //             // define a string to put between each file in the concatenated output
        //         separator: ';'
        //     },

        //     dist: {
        //         // the files to concatenate
        //         src: ['<%= distFolder %>assets/*.js','<%= distFolder %>coffee-compiled/*.js'],
        //         // the location of the resulting JS file
        //         dest: '<%= distFolder %><%= pkg.name %>.js'
        //     }
        // },

        jshint: {
            files: ['<%= distFolder %>*.js'],
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
                    '<%= distFolder %><%= pkg.name %>.js': ['<%= distFolder %><%= pkg.name %>.js']
                }
            }
        },

        watch: {

            scripts: {
                // We watch and compile sass files as normal but don't live reload here
                files: ['<%= appFolder %>**/*.js', '<%= appFolder %>**/*.coffee'],
                tasks: [ 'coffee', 'jshint' ],
            },

            copy: {
                files: [ '<%= appFolder %>**/*', '!<%= appFolder %>**/*.coffee' ],
                tasks: [ 'copy' ]
            },

            clean: {
                files: [ '<%= appFolder %>**/*', '!<%= appFolder %>**/*.coffee' ],
                tasks: [ 'clean:postbuild' ]
            },

            livereload: {
                // These files are sent to the live reload server after sass compiles to them
                options: { livereload: true },
                files: ['<%= distFolder %>**/*'],
            },
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['clean:build', 'copy', 'coffee', 'jshint', 'clean:postbuild', 'watch']);
    grunt.registerTask('build', ['clean:build', 'copy', 'coffee', 'jshint', 'uglify', 'clean:postbuild'])

};