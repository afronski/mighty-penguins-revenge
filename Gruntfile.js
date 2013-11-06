(function() {
  "use strict";

  module.exports = function(grunt) {
    grunt.initConfig({
      clean: {
        coverage: [ "coverage" ]
      },

      mkdir: {
        all: {
          options: {
            create: [ "coverage" ]
          }
        }
      },

      jshint: {
        options: grunt.file.readJSON(".jshintrc"),

        gruntfile: {
          files: {
            src: "Gruntfile.js"
          }
        },

        src: {
          files: {
            src: "src/**/*.js"
          }
        },

        test: {
          files: {
            src: "test/**/*.js"
          },

          options: {
            globals: {
              describe: true,
              it: true
            }
          }
        }
      },

      watch: {
        gruntfile: {
          files: "<%= jshint.gruntfile.files.src %>",
          tasks: [
            "jshint:gruntfile"
          ]
        },

        src: {
          files: "<%= jshint.src.files.src %>",
          tasks: [
            "jshint:src",
            "mochaTest"
          ]
        },

        test: {
          files: "<%= jshint.test.files.src %>",
          tasks: [
            "jshint:test",
            "mochaTest"
          ]
        }
      },

      mochaTest: {
        test: {
          options: {
            reporter: "spec"
          },

          src: [
            "test/**/*.js"
          ]
        }
      },

      exec: {
        coverage: {
          command: "istanbul cover _mocha -- -u exports -R spec",
          stdout: true
        }
      }

    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-mkdir");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("default", [ "clean", "mkdir", "jshint", "mochaTest", "exec:coverage" ]);
  };

} ());