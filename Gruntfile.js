var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

grunt.initConfig({
  babel: {
    options: {
      sourceMap: true,
      modules: 'ignore'
    },
    dist: {
      files: [{
        expand: true,
        cwd: 'src/',
        src: ['**/*.js', '!intro.js', '!outro.js'],
        dest: '.tmp/es5/all'
      }]
    }
  },
  concat: {
    options: {
      sourceMap: true,
      separator: '\n'
    },
    dist: {
      src: [
        'src/intro.js',
        '.tmp/es5/all/**/*.js',
        'src/outro.js'
      ],
      dest: 'dist/mol3d.js'
    }
  },
  uglify: {
    options: {
      sourceMap: true
    },
    build: {
      files: {
        'dist/mol3d.min.js': ['dist/mol3d.js']
      }
    }
  },
  watch: {
    options: {
      spawn: false
    },
    livereload: {
      files: ['src/**/*.js', 'examples/**/*'],
      options: {
        livereload: true
      }
    },
    scripts: {
      files: ['src/**/*.js'],
      tasks: ['default']
    },
    examples: {
      files: ['examples/**/*']
    }
  },
  jshint: {
    options: {
      jshintrc: '.jshintrc'
    },
    allFiles: [
      'src/**/*.js', '!src/intro.js', '!src/outro.js'
    ]
  },
  clean: {
    tmp: ['.tmp']
  }
});

grunt.registerTask('default', ['clean', 'babel', 'concat:dist']);

grunt.registerTask('build', ['default', 'uglify']);