const gulp = require('gulp');
//utilities
const del = require('del');
const plumber = require('gulp-plumber');
//css
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
//html
const htmlReplace = require('gulp-html-replace');
const htmlMin = require('gulp-htmlmin');
//images
const imagemin = require('gulp-imagemin');
//watch & BrowserSync
const browserSync = require('browser-sync');
const server = browserSync.create();

function reload(done) {
   server.reload();
   done();
}

function serve(done) {
   server.init({
      server: {
         baseDir: './'
      }
   });
   done();
}

//styles:development
gulp.task('stylesDev', () => {
   return gulp
      .src('./sass/*.sass')
      .pipe(plumber())
      .pipe(sass({ outputStyle: 'enhanced' }).on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(gulp.dest('./css'));
});

//styles:distribution
gulp.task('styles', () => {
   return gulp
      .src('./sass/*.sass')
      .pipe(plumber())
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(gulp.dest('./dist/css'));
});

gulp.task('images', () => {
   return gulp
      .src('./img/*')
      .pipe(
         imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
               plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
            })
         ])
      )
      .pipe(gulp.dest('./dist/img'));
});

gulp.task('html', function() {
   return gulp
      .src('./*.html')
      .pipe(
         htmlReplace({
            css: './css/style.css'
         })
      )
      .pipe(
         htmlMin({
            sortAttributes: true,
            sortClassName: true,
            collapseWhitespace: true
         })
      )
      .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', () => {
   return del(['./dist/**', '!./dist']);
});

//watch
gulp.task(
   'default',
   gulp.series(
      'clean',
      gulp.parallel('images', 'stylesDev', 'html', serve, function watchFiles() {
         //
         gulp.watch('./sass/*.sass', gulp.series('stylesDev', reload));
         gulp.watch('/img/*', gulp.series('images', reload));
         gulp.watch('./*.html', gulp.series('html', reload));
      })
   )
);

//distribution build
gulp.task('build', gulp.series('clean', gulp.parallel('images', 'styles', 'html')));
