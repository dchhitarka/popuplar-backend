const express = require('express');
const router = express.Router();
const authController = require('./controllers/auth');
const userController = require('./controllers/user');
const postController = require('./controllers/posts');
const searchController = require('./controllers/search');
const { body } = require('express-validator');
const { catchErrors } = require('./handlers/errorHandlers');



// AUTH ROUTES
router.post(
    '/login',
    body('email').isEmail().normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    }),
    body('password').isLength({ min: 4 }),
    authController.login
);

router.post('/register',
    body('email').isEmail().normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    }),
    body('password').isLength({ min: 6 }),
    body('password').isLength({ min: 2 }),
    authController.register,
);
router.get('/logout', authController.isLoggedIn, authController.logout);
router.get('/isAuthenticated', authController.isAuthenticated);

// USER ROUTES
router.get('/profile', authController.isLoggedIn, catchErrors(userController.getProfile));
router.put('/profile', authController.isLoggedIn, catchErrors(userController.updateProfile));
router.delete('/profile', authController.isLoggedIn, catchErrors(userController.deleteProfile));

// FOLLOW/UNFOLLOW USER
router.post('/follow', authController.isLoggedIn, catchErrors(userController.followUser));
router.put('/unfollow', authController.isLoggedIn, catchErrors(userController.unFollowUser));

// POSTS ROUTES
router.get('/posts', authController.isLoggedIn, catchErrors(postController.getPosts));
router.post('/posts', authController.isLoggedIn, catchErrors(postController.createPost));
router.get('/posts/:id', authController.isLoggedIn, catchErrors(postController.getPost));
router.put('/posts/:id', authController.isLoggedIn, catchErrors(postController.updatePost));
router.delete('/posts/:id', authController.isLoggedIn, catchErrors(postController.deletePost));

// COMMENTS ROUTE
router.get('/posts/:id/comments', authController.isLoggedIn, catchErrors(postController.getPostComments));
router.post('/posts/:id/comments', authController.isLoggedIn, catchErrors(postController.createPostComment));
router.put('/posts/:id/comments/:comment_id', authController.isLoggedIn, catchErrors(postController.updatePostComment));
router.delete('/posts/:id/comments/:comment_id', authController.isLoggedIn, catchErrors(postController.deletePostComment));
// POST COMMENT ENGAGE ROUTE
router.post('/posts/:id/comments/:comment_id/react', authController.isLoggedIn, catchErrors(postController.reactOnPostComment));

// SAVE POSTS ROUTES
router.get('/posts/saved', authController.isLoggedIn, catchErrors(userController.getSavedPosts));
router.post('/posts/:id/save', authController.isLoggedIn, catchErrors(postController.savePost));
router.delete('/posts/:id/save', authController.isLoggedIn, catchErrors(postController.unsavePost));

// POST LIKE ROUTE
router.get('/posts/liked', authController.isLoggedIn, catchErrors(userController.getLikedPosts));
router.post('/posts/:id/like', authController.isLoggedIn, catchErrors(postController.likePost));
router.delete('/posts/:id/unlike', authController.isLoggedIn, catchErrors(postController.unlikePost));

// GET COMMENTED ROUTE
router.get('/posts/commented', authController.isLoggedIn, catchErrors(userController.getCommentedPosts));

// SEARCH ROUTES
router.get('/search?cat=posts&q=:q', authController.isLoggedIn, catchErrors(searchController.getPosts));
router.get('/search?cat=`user&q=:q', authController.isLoggedIn, catchErrors(searchController.getUsers));

router.get('/faker/create/post', catchErrors(postController.createFakePosts));

module.exports = router;