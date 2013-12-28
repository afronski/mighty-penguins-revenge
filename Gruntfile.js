(function () {
    "use strict";

    var IstanbulCommand = "istanbul cover node_modules/.bin/_mocha -- -u exports -R spec test/server/ &&" +
                          "istanbul report --format html --dir reports/server";

    module.exports = function (grunt) {
        grunt.initConfig({
            "clean": {
                coverage: [ "coverage" ]
            },

            "mkdir": {
                all: {
                    options: {
                        create: [ "coverage" ]
                    }
                }
            },

            "jshint": {
                options: grunt.file.readJSON(".jshintrc"),

                gruntfile: {
                    files: {
                        src: "Gruntfile.js"
                    },

                    options: {
                        node: true
                    }
                },

                serverSource: {
                    files: {
                        src: [
                            "server/*.js",
                            "server/**/*.js"
                        ]
                    },

                    options: {
                        node: true
                    }
                },

                clientSource: {
                    files: {
                        src: [
                            "client/src/*.js",
                            "client/src/**/*.js"
                        ]
                    },

                    options: {
                        browser: true
                    }
                },

                serverTest: {
                    files: {
                        src: [
                            "test/server/*.js",
                            "test/server/**/*.js"
                        ]
                    },

                    options: {
                        node: true,

                        globals: {
                            beforeEach: true,
                            afterEach: true,
                            before: true,
                            after: true,
                            describe: true,
                            it: true
                        }
                    }
                },

                clientTest: {
                    files: {
                        src: [
                            "test/client/suites/*.js",
                            "test/client/suites/**/*.js"
                        ]
                    },

                    options: {
                        browser: true
                    }
                }
            },

            "watch": {
                gruntfile: {
                    files: "<%= jshint.gruntfile.files.src %>",
                    tasks: [
                        "jshint:gruntfile"
                    ]
                },

                serverSource: {
                    files: "<%= jshint.serverSource.files.src %>",
                    tasks: [
                        "jshint:serverSource",
                        "mochaTest"
                    ]
                },

                clientSource: {
                    files: "<%= jshint.clientSource.files.src %>",
                    tasks: [
                        "jshint:clientSource",
                        "connect",
                        "qunit"
                    ]
                },

                serverTest: {
                    files: "<%= jshint.serverTest.files.src %>",
                    tasks: [
                        "jshint:serverTest",
                        "mochaTest"
                    ]
                },

                clientTest: {
                    files: "<%= jshint.clientTest.files.src %>",
                    tasks: [
                        "jshint:clientTest",
                        "connect",
                        "qunit"
                    ]
                }
            },

            "mochaTest": {
                serverTest: {
                    options: {
                        reporter: "spec"
                    },

                    src: "<%= jshint.serverTest.files.src %>"
                }
            },

            "exec": {
                serverCodeCoverage: {
                    command: IstanbulCommand,
                    stdout: true
                }
            },

            "qunit": {
                options: {
                    "--web-security": "no",

                    coverage: {
                        src: "<%= jshint.clientSource.files.src %>",

                        baseUrl: ".",
                        instrumentedFiles: "coverage",
                        htmlReport: "reports/client"
                    },
                },

                all: {
                    options: {
                        urls: [
                            "http://localhost:9999/test/client/TestSuite.html"
                        ]
                    }
                }
            },

            "connect": {
                server: {
                    options: {
                        port: 9999,
                        base: "."
                    }
                }
            }
        });

        grunt.loadNpmTasks("grunt-contrib-clean");
        grunt.loadNpmTasks("grunt-contrib-connect");
        grunt.loadNpmTasks("grunt-contrib-jshint");
        grunt.loadNpmTasks("grunt-contrib-watch");

        grunt.loadNpmTasks("grunt-exec");
        grunt.loadNpmTasks("grunt-mkdir");
        grunt.loadNpmTasks("grunt-mocha-test");
        grunt.loadNpmTasks("grunt-qunit-istanbul");

        grunt.registerTask("common", [ "clean", "mkdir", "jshint" ]);
        grunt.registerTask("client", [ "connect", "qunit" ]);
        grunt.registerTask("server", [ "mochaTest", "exec:serverCodeCoverage" ]);

        grunt.registerTask("default", [ "common", "server", "client" ]);
    };

} ());