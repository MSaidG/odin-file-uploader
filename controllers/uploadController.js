const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const removeAccents = require("remove-accents");
const fs = require("fs");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const storage = multer.memoryStorage();
upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadPost = [
  upload.single("file"),
  async (req, res) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    req.file.originalname = removeAccents(
      Buffer.from(req.file.originalname, "latin1").toString("utf8")
    );

    const ext = path.extname(req.file.originalname);
    const name = path.basename(req.file.originalname, ext);

    const { data, error } = await supabase.storage
      .from("private-bucket")
      .upload(name + "-" + uniqueSuffix + ext, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.log(error);
    }

    console.log("Data: " + data);
    res.redirect("/upload");
  },
];

const filesGet = async (req, res) => {
  const { data, error } = await supabase.storage.from("private-bucket").list();
  if (error) {
    console.log(error);
    throw error;
  }

  res.render("files", { files: data, user: req.user });
};

const fileGet = async (req, res) => {
  const { data, error } = await supabase.storage
    .from("private-bucket")
    .download(req.params.name);
  if (error) {
    console.log(error.message);
    throw error;
  }
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(buffer);
  console.log(data);

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
  console.log(data);
  console.log(req.body.name);
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
  console.log("signedUrl: " + data[0].signedUrl);
  if (error) {
    console.log(error.message);
    throw error;
  }
  res.redirect("/upload/files");
};

module.exports = {
  uploadPost,
  filesGet,
  fileGet,
  fileDelete,
  fileShare,
};
