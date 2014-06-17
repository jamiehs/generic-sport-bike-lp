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
    },

    coffee: {
      compile: {
        files: {
          'js/scripts.js': ['js/coffee/scripts.coffee'] // compile and concat into single file
        }
      }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  
  grunt.registerTask('default', ['watch']); // run the watch task by default
};