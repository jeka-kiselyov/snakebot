module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      javascript: {
        files: ['app/**/*.js'],
        tasks: ['mochacli:local']
      }
    },
    env: {
      options: {},
      test: {
        NODE_ENV: 'test'
      }
    },
    mochacli: {
      options: {
        require: [],
        reporter: 'spec',
        bail: true,
        timeout: 600000,
        files: ['app/tests/*.js']
      },
      local: {
        timeout: 25000,
        env: {
          NODE_ENV: 'test'
        }
      },
      prod: {
        timeout: 10000,
        env: {
          NODE_ENV: 'testprod'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-env');

  grunt.registerTask('default', ['mochacli:local']);
  grunt.registerTask('watchtests', ['env:test', 'watch:javascript']);

};