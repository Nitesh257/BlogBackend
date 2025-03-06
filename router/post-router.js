const express = require("express");
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require("../controllers/post-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const postController = require("../controllers/post-controller")
const router = express.Router();
const {upload}=require("../controllers/post-controller")
router.post("/", authMiddleware, createPost); // Create a post (Auth required)
router.get("/", getAllPosts); // Get all posts (Public)
router.get("/:id", getPostById); // Get a single post (Public)
router.put("/:id", authMiddleware, updatePost); // Update post (Auth required)
router.delete("/:id", authMiddleware, deletePost); // Delete post (Auth required)
router.put("/:id/like", authMiddleware, postController.likePost);
router.put("/:id/unlike", authMiddleware, postController.unlikePost);
router.post("/:id/comments", authMiddleware, postController.addComment);
router.post("/:id/upload", authMiddleware, upload.single("coverImage"), postController.uploadImage);


router.post(
  "/:id/upload",
  authMiddleware,
  upload.single("coverImage"),
  postController.uploadImage // ✅ Use the controller that saves to the database
);
  


module.exports = router;
