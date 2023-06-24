var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

gulp.task('sass', function(cb) {
  gulp
    .src('styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('styles'));
  cb();
});

gulp.task('compile-templates', function() {
  return gulp
    .src('game-sheets/partials/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(
      declare({
        namespace: 'fright9e.templates',
        noRedeclare: true, // Avoid duplicate declarations
      })
    )
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('module/dist'));
});

gulp.task('default', gulp.series('sass', 'compile-templates'));

