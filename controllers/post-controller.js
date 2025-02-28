const Post = require("../models/post-model");
const multer = require("multer");
const path=require("path");
// image upload 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null,uniqueName);
    },
});

// Initialize multer
const upload = multer({ storage });
exports.upload = upload;

// Create a new blog post
exports.createPost = async (req, res) => {
    try {
      const { title, content, tags } = req.body;
  
      const newPost = new Post({
        title,
        content,
        tags,
        author: req.user._id, 
        coverImage: "",
      });
  
      const savedPost = await newPost.save();
  
      res.status(201).json({ success: true, post: savedPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ success: false, message: "Failed to create post" });
    }
  };

// Get all blog posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get a single blog post
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username email");
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        // Increase view count
        post.views += 1;
        await post.save();

        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Update a blog post
exports.updatePost = async (req, res) => {
    try {
        const { title, content, tags, coverImage } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.coverImage = coverImage || post.coverImage;

        await post.save();
        res.status(200).json({ success: true, message: "Post updated successfully", post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await post.deleteOne();
        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
// Like a post
exports.likePost = async (req, res) => {
    try {
        console.log("User Object:", req.user); // Debugging

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const userId = req.user._id; // Fix: Use _id instead of userId
        console.log("User ID:", userId); // Debugging

        if (post.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: "You already liked this post" });
        }

        post.likes.push(userId);
        await post.save();

        res.status(200).json({ success: true, message: "Post liked", post });
    } catch (error) {
        console.error("Error:", error); // Debugging
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const userId = req.user._id;

        // Check if the user has already liked the post
        if (!post.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: "You haven't liked this post yet" });
        }

        // Remove the user from the likes list
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        await post.save();

        res.status(200).json({ success: true, message: "Post unliked", post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const newComment = {
            userId: req.user.userId,
            comment,
        };

        post.comments.push(newComment);
        await post.save();

        res.status(200).json({ success: true, message: "Comment added", post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.uploadImage = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
      }
  
      // ✅ Use $set to update the coverImage field
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { $set: { coverImage: `/uploads/${req.file.filename}` } },
        { new: true, runValidators: true } // Return updated document and ensure validation
      );
  
      if (!updatedPost) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Image uploaded and post updated successfully",
        imageUrl: updatedPost.coverImage,
        post: updatedPost,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  
  
  