var fs = require('fs');
var path = require('path');
if (process.argv.length < 5) {
  console.error('Usage:', process.argv[0], process.argv[1], ' IN.JSON IN.JSON [IN.JSON ...] OUT.JSON');
  process.exit(1);
}

var out = [];
process.argv.slice(2, -1).forEach(function (f) {
  out.push.apply(out, require(path.resolve(f)));
});
fs.writeFileSync(process.argv.slice(-1)[0], JSON.stringify(out));

