const express = require("express");
const router = express.Router();
const {
  uploadPost,
  filesGet,
  fileDownload,
  fileDelete,
  fileShare,
  fileDetails,
} = require("../controllers/uploadController");

router.get("/", (req, res) => {
  res.render("upload", { user: req.user, info: req.flash("info") });
});

router.post("/", uploadPost);
router.get("/files/folder/:name", filesGet);
router.post("/files/folder/:name", uploadPost);
router.get("/files/:folder/details/:name", fileDetails);
router.post("/files/:name", fileDownload);
router.post("/files", fileShare);
router.delete("/delete", fileDelete);

module.exports = router;
