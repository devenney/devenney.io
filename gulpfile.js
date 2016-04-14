/*jslint node: true*/

"use strict";

var gulp = require('gulp');

var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var critical = require('critical');
var eol = require('gulp-eol');
var fileinclude = require('gulp-file-include');
var htmlmin = require('gulp-htmlmin');
var markdown = require('markdown');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

gulp.task('mocha', function() {
    gulp.src('./test/*.js')
        .pipe(mocha({ reporter: 'list' }));
});

gulp.task('html', function () {
	return gulp.src(['app/index.html'])
		.pipe(fileinclude({
			indent: true,
			filters: {
				markdown: markdown.parse
			}
		}))
		.pipe(eol())
		.pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
    return gulp.src(['app/css/images/*'])
        .pipe(gulp.dest('dist/css/images'));
});

gulp.task('sass', function () {
	return gulp.src('app/sass/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist/css'));
});

gulp.task('css', function() {
	return gulp.src('app/css/*.css')
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('minifycss', function() {
    gulp.src(['dist/css/*.css', '!dist/css/*.min.css'])
        .pipe(cssmin({ compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('minifyhtml', function() {
	gulp.src('dist/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist'))
});

gulp.task('fonts', function() {
	return gulp.src('app/fonts/*')
		.pipe(gulp.dest('dist/fonts/'));
});

gulp.task('js-base', function () {
	return gulp.src(['app/js/base/*.js'])
		.pipe(concat('core.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(rename('core.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('js-ie', function () {
	return gulp.src('app/js/ie/*.js')
		.pipe(concat('ie.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(rename('ie.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('js-lib', function() {
	return gulp.src(['app/js/lib/*.js'])
		.pipe(concat('lib.js'))
                .pipe(gulp.dest('dist/js'))
                .pipe(rename('lib.min.js'))
                .pipe(uglify())
                .pipe(gulp.dest('dist/js'));
});

gulp.task('js-jquery', function() {
	return gulp.src(['app/js/jquery.min.js', 'app/js/skel.min.js'])
		.pipe(gulp.dest('dist/js'));
});

gulp.task('critical', function() {
	return critical.generate({
		inline: true,
		minify: true,
		base: 'dist/',
		src: 'index.html',
		dest: 'dist/index.html',
		width: 1920,
		height: 1080
	});
});

gulp.task('scripts', ['js-base', 'js-ie', 'js-jquery', 'js-lib']);
gulp.task('minify', ['minifycss', 'minifyhtml']);

gulp.task('test', ['mocha']);

gulp.task('default', function() {
	runSequence(['css', 'images', 'fonts', 'html', 'sass'], ['scripts'], ['critical'], ['minify']);
});
