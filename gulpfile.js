const { gulp, src, dest, watch, parallel, series } = require('gulp');
let browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const { Version } = require('sass');
const autoprefixer = require('gulp-autoprefixer');
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const del = require('del');


function nunjucks() {
    return src('docs/*.njk')
    .pipe(nunjucksRender())
    .pipe(dest('docs'))
    .pipe(browserSync.stream());
} 

function browser() {
    browserSync.init({
        server: {
            baseDir: "./docs/"
        }
    });
}

function styles() {
    return src('./docs/scss/**/*.scss')
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      //.pipe(concat('style.min.css'))
      .pipe(rename({
        suffix: ".min"
      }))
      .pipe(autoprefixer({
            overrideBrowserlist: ['last 10 versions'],
            grid: true
      }))
      .pipe(dest('./docs/css'))
      .pipe(browserSync.stream());
  };

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/mixitup/dist/mixitup.js',
        'node_modules/@fancydocss/ui/dist/fancybox/fancybox.umd.js',
        'docs/js/main.js',
        'node_modules/rateyo/src/jquery.rateyo.js',
        'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
        'node_modules/jquery-form-styler/dist/jquery.formstyler.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('docs/js'))
    .pipe(browserSync.stream());
}



function watching() {
    watch(['./docs/**/*.scss'], styles);
    watch(['./docs/*.njk'], nunjucks);
    watch(['./docs/js/**/*.js', '!./docs/js/main.min.js'], scripts);
    watch(['./docs/**/*.html']).on('change', browserSync.reload);
}
function build() {
    return src([
        'docs/**/*.html',
        'docs/css/style.min.css',
        'docs/js/main.min.js',
    ], {base: 'docs'})
    .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.cleanDist = cleanDist;
exports.nunjucks = nunjucks;
exports.build = series(cleanDist, build);

exports.default = parallel(nunjucks, styles, scripts, browser, watching);