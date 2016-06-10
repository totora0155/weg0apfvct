const path = require('path');
const cli = require('meow')('', {
  d: 'dirname',
  n: 'fontName',
  c: 'className',
  p: 'fontPath',
  t: 'connectionToken'
});
const _ = require('lodash');
const svgmin = require('gulp-svgmin');
const iconfont = require('gulp-iconfont');
const tap = require('gulp-tap');
const runTimestamp = Math.round(Date.now() / 1000);

const dirname = cli.flags.d || cli.flags.dirname;
if (!dirname) {
  console.log('dirname');
  process.exit(1);
}
const fontName = cli.flags.f || cli.flags.fontName;
if (!fontName) {
  console.log('fontNameを指定してください');
  process.exit(1);
}
const fontPath = cli.flags.p || cli.flags.fontPath || 'fonts/';
const formats = cli.flags.e
                || cli.flags.extensions
                || ['ttf', 'eot', 'woff', 'svg'];
const className = cli.flags.c || cli.flags.className;
if (!className) {
  console.log('classNameを指定してください');
  process.exit(1);
}
const connectionToken = cli.flags.t || cli.flags.connectionToken || '__';

gulp.task('webfont', () => {
  gulp.src(path.join(dirname, '*.svg'))
    .pipe(svgmin())
    .pipe(iconfont({
      fontName,
      formats,
      normalize: true,
      prependUnicode: true
    }))
    .on('glyphs', (glyphs, options) => {
      const data = Object.assign({}, {glyphs}, {
        fontName,
        fontPath,
        className,
        connectionToken
      });
      gulp.src('webfont-template.css')
        .pipe(tap(file => {
          const contents = _.template(file.contents.toString())(data);
          file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest(dirname));
    })
    .pipe(gulp.dest(path.join(dirname, fontPath)));
});
