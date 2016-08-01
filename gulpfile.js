// gulpfile.js
const gulp = require('gulp');
require('jibo-gulp')(gulp);

gulp.on('stop', () => {
  process.nextTick(() => {
    process.exit(0);
  });
});
