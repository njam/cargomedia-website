module.exports = function(grunt) {

  var vendor = [
    'fluidvids.js',
    'prismic.io',
    'query-string',
    'underscore'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      vendor: {
        src: ['.'],
        dest: 'tmp/vendor.js',
        options: {
          debug: true,
          require: vendor,
          external: null
        }
      },
      app: {
        options: {
          debug: true,
          external: vendor
        },
        files: {
          'tmp/default.js': ['js/default.js'],
          'tmp/index.js': ['js/index.js']
        }
      }
    },
    uglify: {
      all: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true
        },
        files: [{
          expand: true,
          cwd: 'tmp',
          src: '**/*.js',
          dest: 'dist'
        }]
      }
    },
    pages: {
      options: {
        bundleExec: true,
        config: '_config.yml',
        src: '.',
        dest: '.jekyll'
      },
      build: {}
    },
    copy: {
      // Copy assets instead of building full site with 'jekyll'
      dist: {
        files: [
          {expand: true, src: ['dist/*'], dest: '<%= pages.options.dest %>/'}
        ]
      },
      css: {
        files: [
          {expand: true, src: ['css/*'], dest: '<%= pages.options.dest %>/'}
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 4000,
          hostname: '*',
          base: '<%= pages.options.dest %>',
          livereload: true
        }
      }
    },
    watch: {
      options: {
        spawn: false
      },
      javascript: {
        files: ['js/**/*.js'],
        tasks: ['browserify', 'uglify', 'copy:dist'],
        options: {
          livereload: true
        }
      },
      css: {
        files: ['css/**/*'],
        tasks: ['copy:css'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['layouts/**/*', 'img/**/*', '*.html'],
        tasks: ['pages:build'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jekyll-pages');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['browserify', 'uglify', 'pages']);
  grunt.registerTask('develop', ['build', 'connect', 'watch']);
};
