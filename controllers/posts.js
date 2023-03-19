const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Post = require('../models/Post');
const PostComments = require('../models/PostComments');
const PostLiked = require('../models/PostLiked');
const { postTypes, storage, imageFilter, baseUrl } = require('../helpers');
const { errors } = require('../handlers/errorHandlers');
const { check } = require('express-validator');
const PostTags = require('../models/PostTags');

// TODO: Get Posts of Accounts I am following
exports.getPosts = async (req, res) => {
    let posts = await Post.find({}).sort({createdAt: -1}).skip(parseInt(req.query?.skip ?? 0)).limit(10);
    // posts.map(async (post) => {
    //     const likes = await PostLiked.find({'postId': post._id}).count();
    //     post.likes = likes;
    //     return post;
    // });
    return res.json({
        status: "success",
        data: {
            posts,
        },
        message: 'Posts fetched'
    })
}

exports.createPost = async (req, res) => {
    const upload = multer({ storage: storage, fileFilter: imageFilter }).array('images', 10);
    upload(req, res, async function(err) {
        if (req.fileValidationError) {
            return res.json({status: 'error', type:"InvalidFileError", error: req.fileValidationError});
        }
        else if (!req.files) {
            // throw Error("Please select an image to upload");
            return res.json({status: 'error', type:"FileNotFoundError", error: 'Please select an image to upload'});
        }
        else if (err) {
            return res.json({status: 'error', type:"FileUploadError", error: err});
        }
        else if (err instanceof multer.MulterError) {
            return res.json({status: 'error', type:"MulterError", error: err});
        }
        const postProperties = ['title', 'content', 'type', 'tags'];
        if(!postProperties.every(key => Object.keys(req.body).includes(key))){
            return res.status(400).json(errors(null, 'incompleteFields'))
        }
        await check('title').escape().trim().run(req);
        await check('content').escape().trim().run(req);
        let post = new Post();
        post.title = req.body.title;
        post.content = req.body.content;
        post.type = req.body.type;
        post.userId = req.user._id;
        post.tags = req.body.tags;
        post.owner = {
            name: req.user.name,
            avatar: req.user.avatar
        };
        post.save();
        const tags = req.body.tags.split(',');
        tags.forEach(tag => {
            PostTags
                .findOne({"tag": tag.trim()})
                .then(res => {
                    if(!res){
                        const newTag = PostTags();
                        newTag.tag = tag.trim();
                        newTag.postId = post._id;
                        newTag.userId = req.user._id
                        newTag.save();
                    }
                })
        })
        const images = [];
        if(req.files){
            req.files.forEach(async (file,i) => {
                const newName = post._id + `_${i}_` + new Date().getTime() + path.extname(file.originalname);
                images.push(baseUrl + 'public/images/' + newName);
                try{
                    const image = sharp(file.path)
                    const meta = await image.metadata()
                    const { format } = meta
                    const config = {
                        jpeg: { quality: 80 },
                        webp: { quality: 80 },
                        png: {compressionLevel: 9, quality: 80},
                        svg: {compressionLevel: 7}
                    }
                    await image[format](config[format])
                    .resize(800, 400)
                    .toFile(path.resolve(file.destination, newName), (err) => {
                        if(err) {
                            console.log("ToFile "+ err);
                            fs.renameSync(file.path, file.path.replace(file.originalname, newName));
                        }
                        else fs.unlinkSync(file.path);
                    });
                }catch(e) {
                    console.log("Error caught: "+e);
                    return res.json({status: "error", "error": e})
                }
            })
        }
        if(images.length > 0){
            post.images = images;
            post.update();
        }
        return res.json({
            status: "success",
            data: {
                post,
            },
            message: 'Post created!'
        })
    });
}

exports.getPost = async (req, res) => {
    let post = await Post.findOne({_id: req.params.id});
    return res.json({
        status: "success",
        data: {
            post,
        }
    })
}

exports.updatePost = async (req, res) => {
    let post = await Post.findOne({_id: req.params.id});
    Object.keys(req.body).forEach(key => {
        if(key && key != '')
        post[key] = req.body[key]
        if(key === "title") post.slug = req.body[key].toLowerCase().split(" ").join("-");
    });
    post.save();
    return res.json({
        status: "success",
        data: {
            post,
        }
    })
}

exports.deletePost = async (req, res) => {
    let result = await Post.findOneAndDelete({"_id": req.params.id});
    if(!result) return res.status(404).json(errors(null, 'dataNotFound'));
    await PostLiked.deleteMany({"postId": req.params.id});
    await PostComments.deleteMany({"postId": req.params.id});
    return res.json({
        status: "success",
        message: `${result?.title} deleted!`
    })
}

exports.likePost = async (req, res) => {
    let liked = await PostLiked.findOne({postId: req.params.id, userId: req.user._id});
    if(liked) return res.status(400).json(errors(null, 'actionNotAllowed'));
    liked = await PostLiked();
    liked.postId = req.params.id;
    liked.userId = req.user._id;
    liked.save();
    let post = Post.findOne({_id: req.params.id});
    post.likes += 1;
    post.save();
    return res.json({
        status: "success",
    })
}

exports.unlikePost = async (req, res) => {
    let liked = await PostLiked.findOneAndDelete({postId: req.params.id, userId: req.user._id});
    let post = Post.findOne({_id: req.params.id});
    post.likes -= 1;
    post.save();

    if(liked) 
        return res.json({
            status: "success",
        })
}

exports.getPostComments = async (req, res) => {
    const comments = await PostComments.find({postId: req.params.id});
    return res.json({
        status: "success",
        data: {
            comments,
        }
    })
}

exports.createPostComment = async (req, res) => {
    if(!Object.keys(req.body).includes('comment') || req.body.comment == ''){
        return res.status(400).json(errors(null, 'incompleteFields'))
    }
    const comment = new PostComments();
    comment.postId = req.params.id;
    comment.userId = req.user._id;
    comment.comment = req.body.comment;
    comment.save();
    let post = Post.findOne({_id: req.params.id});
    post.comments += 1;
    if(Object.keys(req.body).includes('replyTo')){
        let parent = await PostComments.findOne({"_id": req.body.replyTo});
        parent.replies.push(comment._id);
        parent.save();
        post.comments += 1;
    }
    post.save();
    return res.json({
        status: "success",
        data: {
            comment,
        }
    })
}

exports.updatePostComment = async (req, res) => {
    const comment = PostComments.findOne({_id: req.params.comment_id});
    await check('comment').escape().trim().run(req);
    comment.comment = req.body.comment;
    comment.save();
    return res.json({
        status: "success",
        data: {
            comment,
        }
    })
}

exports.deletePostComment = async (req, res) => {
    const comment = PostComments.findOneAndDelete({_id: req.params.comment_id});
    let post = Post.findOne({_id: req.params.id});
    post.comments -= 1;
    comment.replies.forEach(async com_id => {
        await PostComments.findOneAndDelete({_id: com_id});
        post.comments -= 1;
    })
    post.save();
    if(comment)
        return res.json({status: "success",});
}

exports.reactOnPostComment = async (req, res) => {
    const comment = PostComments.findOne({_id: req.params.comment_id});
    Object.keys(req.body).forEach(key => {
        if(['upVote', 'downVote'].includes(key)) comment[key] += req.body[key]
    });
    return res.json({
        status: "success",
    })
}


exports.savePost = async (req, res) => {
    let saved = await PostSaved.findOne({postId: req.params.id, userId: req.user._id});
    if(saved) return res.status(400).json(errors(null, 'actionNotAllowed'));
    saved = await PostSaved();
    saved.postId = req.params.id;
    saved.userId = req.user._id;
    saved.save();
    return res.json({
        status: "success",
        data: {
            posts: [],
        }
    })
}

exports.unsavePost = async (req, res) => {
    let saved = await PostSaved.findOneAndDelete({postId: req.params.id, userId: req.user._id});
    if(saved)
        return res.json({
            status: "success",
            data: {
                posts: [],
            }
        })
}

exports.createFakePosts = async (req, res) => {
    var faker = require('faker');
    try{
        for(let i = 0; i < 1; i++){
            let post = new Post();
            post.title = faker.lorem.sentence();
            post.content = faker.lorem.paragraphs();
            post.images = [faker.image.imageUrl(), faker.image.imageUrl(), faker.image.imageUrl()];
            post.type = postTypes['2'];
            post.userId = "61d97fedd8b53eb030a2420c";
            post.owner = {
                name: faker.name.findName(),
                avatar: faker.image.imageUrl()
            };
            post.save();
        }
        return res.json({message: 'Posts created'})
    } catch(e){
        console.log(e);
    }
}
