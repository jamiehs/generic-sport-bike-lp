module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    watch: {
      livereload: {
        files: ['index.html', 'css/*.css', 'js/**/*.js'], // watch for changes to these files
        options: {
          livereload: true // then live reload
        }
      },
      coffeescript: {
        files: [
          'js/coffee/scripts.coffee'
        ],
        tasks: ['coffee']
      },
      sass: {
        files: [
          'css/*.scss'
        ],
        tasks: ['sass']
      },
    },

    coffee: {
      compile: {
        files: {
          'js/scripts.js': ['js/coffee/scripts.coffee'] // compile and concat into single file
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded',
          compass: true,
          // Source maps are available, but require Sass 3.3.0 to be installed
          // https://github.com/gruntjs/grunt-contrib-sass#sourcemap
          sourcemap: false
        },
        files: {
          'css/styles.css': 'css/styles.scss'
        }
      }
    },

    uglify: {
      dist: {
        files: {
          'js/all.min.js': [
            'js/jquery-1.10.2.min.js',
            'js/bootstrap.min.js',
            'js/LAB.min.js',
            'js/scripts.js'
          ]
        },
        options: {
          // JS source map: to enable, uncomment the lines below and update sourceMappingURL based on your install
          sourceMap: true
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.registerTask('default', ['sass', 'coffee', 'uglify', 'watch']); // run the watch task by default
};