// Generated on 2014-06-23 using generator-angular-xl 0.6.1
'use strict';
var path = require('path');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var includes = require('./resources.json');

  var yeomanConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: require('./bower.json').distPath || 'dist'
  };

  var externalJsSrc = includes.javascript.external.map(function (path) {
    if (typeof path === 'object') {
      return yeomanConfig.app + '/' + path.src;
    }
    return yeomanConfig.app + '/' + path;
  });

  var externalJsMin = includes.javascript.external.map(function (path) {
    if (typeof path === 'object') {
      return yeomanConfig.app + '/' + path.min;
    }
    path = path.replace(/(\.js|\.src.js)/, ".min.js");
    return yeomanConfig.app + '/' + path;
  });

  var externalJsExcludeFromBuild = includes.javascript.externalExcludeFromBuild.map(function (path) {
    return '!' + yeomanConfig.app + '/' + path;
  });

  var appJs = includes.javascript.app.map(function (path) {
    return yeomanConfig.app + '/' + path;
  });

  var appJsExcludeFromBuild = includes.javascript.appExcludeFromBuild.map(function (path) {
    return '!' + yeomanConfig.app + '/' + path;
  });

  var prototypeAppJs = appJs.slice(0); //copy appJs
  prototypeAppJs.splice(2, 0, (yeomanConfig.app + '/dev/**/*.js')); //insert dev stuff (mocks etc) after module.js

  var cssFiles = includes.css.map(function (path) {
    return '.tmp/' + path;
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    yeoman: yeomanConfig,
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/**/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },
    sass: {
      options: {
        includePaths: ['<%= yeoman.app %>/bower_components']
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.css': '<%= yeoman.app %>/styles/main.scss'
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/**/*.js',
            '<%= yeoman.dist %>/styles/**/*.css'
          ]
        }
      }
    },
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/assets/images',
            src: '{,*/}*.{png,jpg,jpeg}',
            dest: '<%= yeoman.dist %>/assets/images'
          }
        ]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.css': [
            '.tmp/styles/**/*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeCommentsFromCDATA: true,
          collapseWhitespace: true,
          removeComments: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: false,
          removeOptionalTags: true,
          removeEmptyElements: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>',
            src: ['*.html', '!index.html', '../.tmp/index.html', 'views/**/*.html', 'states/**/*.html', 'components/**/*.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              'assets/images/**/*.{gif,webp}',
              'assets/fonts/**/*',
              'CNAME',
              'package.json'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/assets/images',
            dest: '<%= yeoman.dist %>/assets/images',
            src: [
              'generated/*'
            ]
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '**/*.css'
      },
      tmpStyles2dist: {
        expand: true,
        cwd: '.tmp/styles/',
        dest: '<%= yeoman.dist %>/styles/',
        src: '**/*.css'
      },
      dev: {
        expand: true,
        cwd: '<%= yeoman.app %>/dev',
        dest: '<%= yeoman.dist %>/dev',
        src: '**/*.js'
      },
      indexHTML: {
        expand: true,
        cwd: '<%= yeoman.app %>/',
        dest: '<%= yeoman.dist %>/',
        src: ['./index.html']
      },
      app: {
        expand: true,
        cwd: '<%= yeoman.app %>/',
        dest: '<%= yeoman.dist %>/',
        src: ['**/*', '!**/*.{scss,sass,coffee}', '!dev/**/*']
      }
    },
    concurrent: {
      server: [
        'sass:dist',
        'copy:styles'
      ],
      dist: [
        'sass:dist',
        'copy:styles',
        'imagemin',
        'htmlmin'
      ]
    },
    ngmin: {
      dist: {
        files: [
          {
            expand: true,
            src: appJs.concat(appJsExcludeFromBuild),
            dest: '.tmp/app_js/'
          }
        ]
      }
    },
    concat: {
      options: {
        // Replace all 'use strict' statements in the code with a single one at the top
//        banner: "'use strict';\n",
//        process: function (src, filepath) {
//          return '// Source: ' + filepath + '\n' +
//            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
//        }
      },
      js: {
        src: externalJsMin.concat(['.tmp/scripts/app.js']).concat(externalJsExcludeFromBuild),
        dest: '<%= yeoman.dist %>/scripts/scripts.js'
      },
      css: {
        src: ["app/bower_components/codemirror/lib/codemirror.css", "app/bower_components/angular/angular-csp.css", '.tmp/styles/**/*.css'],
        dest: '<%= yeoman.dist %>/styles/main.css'
      }
    },
    uglify: {
      options: {
        banner: [
          '/**',
          ' * <%= pkg.description %>',
          ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
          ' * @link <%= pkg.homepage %>',
          ' * @author <%= pkg.author %>',
          ' * @license MIT License, http://www.opensource.org/licenses/MIT',
          ' */'
        ].join('\n')
      },
      dist: {
        files: {
          '.tmp/scripts/app.js': appJs.map(function (path) {
            return '.tmp/app_js/' + path;
          })
        }
      }
    },
    'sails-linker': {

      devJs: {
        options: {
          startTag: '<!--INJECT SCRIPTS-->',
          endTag: '<!--/INJECT SCRIPTS-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '<%= yeoman.app %>',
          relative: true
        },
        files: {
          '<%= yeoman.app %>/index.html': externalJsSrc.concat(prototypeAppJs)
        }
      },

      prodJs: {
        options: {
          startTag: '<!--INJECT SCRIPTS-->',
          endTag: '<!--/INJECT SCRIPTS-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '<%= yeoman.dist %>',
          relative: true
        },
        files: {
          '<%= yeoman.dist %>/index.html': ['<%= yeoman.dist %>/scripts/*.js']
        }
      },

      devStyles: {
        options: {
          startTag: '<!--INJECT STYLES-->',
          endTag: '<!--/INJECT STYLES-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '.tmp',
          relative: true
        },

        files: {
          '<%= yeoman.app %>/index.html': cssFiles
        }
      },

      prodStyles: {
        options: {
          startTag: '<!--INJECT STYLES-->',
          endTag: '<!--/INJECT STYLES-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '<%= yeoman.dist %>',
          relative: true
        },
        files: {
          '<%= yeoman.dist %>/index.html': ['<%= yeoman.dist %>/styles/*.css']
        }
      }

    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'], // '-a' for all files
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 Chrome versions']
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/styles/',
            src: '**/*.css',
            dest: '.tmp/styles/'
          }
        ]
      }
    }

  });

  grunt.registerTask('build', function (target) {

    if (target === 'dev') {
      console.log('Building using development profile');
      grunt.task.run([
        'clean',
        'sass:dist',
        'autoprefixer',
        'copy:styles',
        'copy:tmpStyles2dist',
        'copy:app',
        'linkAssets-dev'
      ]);
    }
    else {
      console.log('Building using production profile');
      grunt.task.run([
        'clean',
        'concurrent:dist',
        'autoprefixer',
        'ngmin',
        'uglify',
        'concat:js',
        'concat:css',
        'copy:dist',
        'cssmin',
        'rev',
        'copy:indexHTML',
        'linkAssets-production',
        'htmlmin'
      ]);
    }
  });

  grunt.registerTask('linkAssets-dev', [
    'sails-linker:devStyles',
    'sails-linker:devJs'
  ]);

  grunt.registerTask('linkAssets-production', [
    'sails-linker:prodStyles',
    'sails-linker:prodJs'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
