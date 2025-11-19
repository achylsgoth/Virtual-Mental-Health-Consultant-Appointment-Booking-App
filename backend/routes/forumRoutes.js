// routes/api/posts.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const postController = require('../controllers/forumPage');


router.get('/', postController.getPosts);


router.get('/:id', postController.getPostById);


router.post('/create', verifyToken, postController.createPost);


router.put('/:id', verifyToken, postController.updatePost);

router.delete('/:id', verifyToken, postController.deletePost);


router.post('/:id/comments', verifyToken, postController.addComment);

router.post('/:id/like', verifyToken, postController.likePost);

module.exports = router;
