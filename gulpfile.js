const gulp = require('gulp');
const exec = require('child_process').exec;

gulp.task('compile',function(cb){
    exec('node ./public/script/compile.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('watch',function(){
    gulp.watch('./src/**',['compile']);
});

gulp.task('redux', ['compile','watch']);