module.exports = (grunt)->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'


    watch:
      livereload:
        files: [
          'index.html'
          'css/*.css'
          'js/**/*.js'
        ]
        options:
          livereload: true

      coffeescript:
        files: ['js/coffee/scripts.coffee']
        tasks: ['coffee']

      sass:
        files: ['css/*.scss']
        tasks: ['sass']


    coffee:
      compile:
        files:
          'js/scripts.js': [
            'js/coffee/scripts.coffee'
          ]


    sass:
      dist:
        options:
          style: 'expanded'
          compass: true
          sourcemap: false
        files:
          'css/styles.css': 'css/styles.scss'


    uglify:
      dist:
        files:
          'js/all.min.js': [
            'js/jquery-1.10.2.min.js'
            'js/bootstrap.min.js'
            'js/LAB.min.js'
            'js/scripts.js'
          ]
        options:
          sourceMap: true


  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'


  grunt.registerTask 'default', [
    'sass'
    'coffee'
    'uglify'
    'watch'
  ]
