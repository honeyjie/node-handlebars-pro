//在开发环境下未启用代码压缩
// var gulp = require('gulp'),
//     rename = require('gulp-rename'),
//     uglify = require("gulp-uglify"),
//     minifyCss = require("gulp-minify-css"),
//     minifyHtml = require("gulp-minify-html"),
//     jshint = require("gulp-jshint"),
//     concat = require("gulp-concat"),
//     imagemin = require('gulp-imagemin'),
//     pump = require('pump');

// //gulp-rename gulp-jshint gulp-concat gulp-uglify gulp-minify-css gulp-minify-html gulp-imagemin gulp-livereload gulp-sourcemaps gulp-autoprefixer 
// //重命名
// //js压缩
// gulp.task('minify-js', function () {
//     pump([
//         gulp.src('./public/js/app/*.js'),
//         uglify(),
//         gulp.dest('./dist/js/app')
//         ])
//     pump([
//         gulp.src('./public/js/lib/*.js'),
//         uglify(),
//         gulp.dest('./dist/js/lib')
//         ])
// });
// //css压缩
// gulp.task('minify-css', function () {
//     pump([
//         gulp.src('./public/css/*.css'),
//         minifyCss(),
//         gulp.dest('./dist/css')
//         ])
// });
// //html压缩
// gulp.task('minify-html', function () {
//     pump([
//         gulp.src('./views/*.hbs'),
//         minifyHtml(),
//         gulp.dest('./dist/html')
//         ])
//     pump([
//         gulp.src('./views/partials/*.hbs'),
//         minifyHtml(),
//         gulp.dest('./dist/html/partials')
//     ])
//     pump([
//         gulp.src('./views/partials/Inslibrary/*.hbs'),
//         minifyHtml(),
//         gulp.dest('./dist/html/partials/Inslibrary')
//     ])
//     pump([
//         gulp.src('./views/layouts/*.hbs'),
//         minifyHtml(),
//         gulp.dest('./dist/html/layouts')
//     ])
// });
// //js代码检查
// gulp.task('jsLint', function () {
//     pump([
//         gulp.src('./public/js/*.js'),
//         jshint(),
//         jshint.reporter(),
//         ])
// });
// //文件合并
// gulp.task('concat', function () {
//     pump([
//         gulp.src('./public/js/*.js'),
//         concat('all.js'), 
//         gulp.dest('./dist/js')
//         ])
// });
// //图片压缩
// gulp.task('img', function () {
//     pump([
//         gulp.src('./public/img/*'),
//         imagemin(),
//         gulp.dest('./dist/img'),
//         ])

// });
// //自动添加前缀
// // gulp.task('demo', function() {
// //     var css = [...];
// //     gulp.src(css)
// //         .pipe(sourcemaps.init())
// //         .pipe(concat("styles.css"))
// //         .pipe(cssnano())
// //         .pipe(sourcemaps.write('.'))
// //         .pipe(gulp.dest('./www/build'));   
// // });
// gulp.task('default', ['minify-js', 'minify-css', 'minify-html', 'jsLint', 'concat', 'img'])