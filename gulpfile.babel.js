import gulp from 'gulp';
import del from 'del';
import jshint from 'gulp-jshint';
import babel from 'gulp-babel';
import path from 'path';
import mocha from 'gulp-mocha';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import notifierReporter from 'mocha-notifier-reporter';

gulp.task('clean:scripts', function() {
    return del([
        'dist/'
    ]);
});

gulp.task('jshint', ['test'], function() {
    return gulp.src(['src/main.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        // Use gulp-notify as jshint reporter
        .pipe(notify(function (file) {
          if (file.jshint.success) {
            return "No JS Linting Errors :)";
          }
          var errors = file.jshint.results.map(function (data) {
          }).join("\n");
          return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
        }));
});

gulp.task('babel', ['jshint'], function() {
    return gulp.src(['src/main.js', 'main.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(`dist`))
        .pipe(notify({ message: 'Babel transpiled successfully' }));
});

gulp.task('scripts', ['babel'], function() {
    return gulp.src(['dist/main.js'])
        .pipe(gulp.dest(`dist`))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('test', function() {
  return gulp.src(['test/test.js'], { read: false })
    .pipe(mocha({
      reporter: notifierReporter.decorate('spec')
    }));
});

gulp.task('default', ['scripts']);
gulp.task('watch', ['scripts'], () => {
    gulp.watch(['src/**/*.js', 'test/**/*.js'], ['scripts']);
});