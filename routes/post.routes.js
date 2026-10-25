import { Router } from 'express';
import checkAuth from '../middleware/checkAuth.js';
import checkOwner from '../middleware/checkOwner.js';
import validateBody from '../middleware/validateBody.js';
import upload from '../middleware/upload.js';
import { createPostSchema, updatePostSchema, commentSchema } from '../validation-schemas/posts.js';
import * as posts from '../queries/post.queries.js';
import * as comments from '../queries/comment.queries.js';

const router = Router();

const checkNumericId = (req, res, next, val) => {
  if (!/^\d+$/.test(val)) return res.status(400).json({ error: 'Invalid id' });
  next();
};
router.param('id', checkNumericId);
router.param('commentId', checkNumericId);

router.get('/', checkAuth, async (req, res, next) => {
  try {
    res.json({ data: await posts.getAllPosts(req.user.id) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', checkAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await posts.getPostById(id, req.user.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ data: { post, comments: await comments.getCommentsByPost(id) } });
  } catch (err) {
    next(err);
  }
});

router.post('/', checkAuth, upload.single('image'), validateBody(createPostSchema), async (req, res, next) => {
  try {
    const row = await posts.createPost({
      userId: req.user.id,
      content: req.body.content,
      image: req.file ? req.file.filename : null,
    });
    res.status(201).json({ message: 'Post published', data: row });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', checkAuth, checkOwner(posts.findPost), validateBody(updatePostSchema), async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) return res.status(400).json({ error: 'Nothing to update' });
    const row = await posts.updatePost(Number(req.params.id), req.body);
    res.json({ message: 'Post updated', data: row });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', checkAuth, checkOwner(posts.findPost), async (req, res, next) => {
  try {
    await posts.deletePost(Number(req.params.id));
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comments', checkAuth, async (req, res, next) => {
  try {
    res.json({ data: await comments.getCommentsByPost(Number(req.params.id)) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', checkAuth, validateBody(commentSchema), async (req, res, next) => {
  try {
    const row = await comments.createComment({
      postId: Number(req.params.id),
      userId: req.user.id,
      content: req.body.content,
    });
    res.status(201).json({
      message: 'Comment added',
      data: {
        id: row.id,
        postId: row.postId,
        userId: row.userId,
        username: req.user.username,
        content: row.content,
        created_at: row.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/comments/:commentId', checkAuth, checkOwner(comments.findComment, 'commentId'), validateBody(commentSchema), async (req, res, next) => {
  try {
    const row = await comments.updateComment(Number(req.params.commentId), req.body.content);
    res.json({ message: 'Comment updated', data: row });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/comments/:commentId', checkAuth, checkOwner(comments.findComment, 'commentId'), async (req, res, next) => {
  try {
    await comments.deleteComment(Number(req.params.commentId));
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/like', checkAuth, async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const rows = await posts.getLikes(postId);
    const alreadyLiked = rows.some((r) => r.userId === req.user.id);
    if (alreadyLiked) await posts.removeLike(postId, req.user.id);
    else await posts.addLike(postId, req.user.id);
    res.json({
      data: { liked: !alreadyLiked, like_count: rows.length + (alreadyLiked ? -1 : 1) },
    });
  } catch (err) {
    next(err);
  }
});

export default router;