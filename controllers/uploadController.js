const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const removeAccents = require("remove-accents");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const storage = multer.memoryStorage();
upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadPost = [
  upload.single("file"),
  async (req, res) => {
    let uploadTo = req.params.name + "/";
    if (uploadTo == "root/" || uploadTo == "/") {
      uploadTo = "";
    }
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    req.file.originalname = removeAccents(
      Buffer.from(req.file.originalname, "latin1").toString("utf8")
    );

    const ext = path.extname(req.file.originalname);
    const name = path.basename(req.file.originalname, ext);

    const { data, error } = await supabase.storage
      .from("private-bucket")
      .upload(uploadTo + name + "-" + uniqueSuffix + ext, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      req.flash("info", "Upload failed!");
    }

    req.flash("info", "Upload successful!");
    res.redirect("/upload/files/folder/" + req.params.name);
  },
];

const filesGet = async (req, res) => {
  let currentFolder = req.params.name;
  if (currentFolder == "root") {
    currentFolder = "";
  }
  const { data, error } = await supabase.storage
    .from("private-bucket")
    .list(currentFolder);
  if (error) {
    console.log(error);
    throw error;
  }
  const files = data.filter((file) => file.id != null);
  const folders = data.filter((file) => file.id == null);
  res.render("files", {
    files: files,
    folders: folders,
    currentFolder: req.params.name,
    user: req.user,
    info: req.flash("info"),
    name: req.flash("name"),
  });
};

const fileDownload = async (req, res) => {
  const { data, error } = await supabase.storage
    .from("private-bucket")
    .download(req.params.name);
  if (error) {
    console.log(error.message);
    throw error;
  }
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.params.name}"`
  );
  res.setHeader("Content-Type", data.type);
  res.setHeader("Content-Length", data.size);
  res.end(buffer);
};

const fileDelete = async (req, res) => {
  const { data, error } = await supabase.storage
    .from("private-bucket")
    .remove([req.body.name]);
  if (error) {
    console.log(error.message);
    throw error;
  }
  res.redirect("/upload/files");
};

const fileShare = async (req, res) => {
  const { data, error } = await supabase.storage
    .from("private-bucket")
    .createSignedUrls([req.body.name], 60);

  if (error) {
    console.log(error.message);
    throw error;
  }

  req.flash("info", data[0].signedUrl);
  req.flash("name", req.body.name);
  res.json({ data: data[0].signedUrl });
};

const fileDetails = async (req, res) => {
  let currentFolder = req.params.folder;
  let currentPath = req.params.folder + "/";
  if (currentFolder == "root") {
    currentFolder = "";
    currentPath = "";
  }
  const { data, error } = await supabase.storage
    .from("private-bucket")
    .list(currentFolder, {
      search: req.params.name,
    });

  const { data: data2, error: error2 } = await supabase.storage
    .from("private-bucket")
    .createSignedUrls(currentPath + [req.params.name], 30);

  if (error) {
    console.log(error.message);
    throw error;
  }
  res.render("file", {
    file: data[0],
    user: req.user,
    url: data2[0].signedUrl,
  });
};

const bucketGet = async (req, res) => {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log(error.message);
    throw error;
  }
  console.log(data);
  res.render("bucket", {
    buckets: data,
    user: req.user,
    info: req.flash("info"),
  });
};

module.exports = {
  uploadPost,
  filesGet,
  fileDownload,
  fileDelete,
  fileShare,
  fileDetails,
  bucketGet,
};
