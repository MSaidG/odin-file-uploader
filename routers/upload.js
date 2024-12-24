const express = require("express");
const router = express.Router();
const {
  uploadPost,
  filesGet,
  fileGet,
  fileDelete,
  fileShare,
} = require("../controllers/uploadController");

router.get("/", (req, res) => {
  res.render("upload", { user: req.user });
});

router.post("/", uploadPost);
router.get("/files", filesGet);
router.get("/files/:name", fileGet);
router.post("/files/:name", fileGet);
router.post("/files", fileShare);
router.delete("/delete", fileDelete);

module.exports = router;
