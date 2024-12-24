var fs = require("fs");

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getDestination(req, file, cb) {
  cb(null, "/dev/null");
}

function MyCustomStorage(opts) {
  this.getDestination = opts.destination || getDestination;
}

MyCustomStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err);

    var outStream = fs.createWriteStream(path);
    console.log(path);
    file.stream.pipe(outStream);
    outStream.on("error", cb);
    outStream.on("finish", async function () {
      cb(null, {
        path: path,
        size: outStream.bytesWritten,
      });
    });
  });
};

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  fs.unlink(file.path, cb);
};

module.exports = function (opts) {
  return new MyCustomStorage(opts);
};
