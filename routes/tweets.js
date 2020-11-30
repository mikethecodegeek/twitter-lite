const express = require("express")
const router = express.Router()

const db = require('../db/models');
const { Tweet } = db;
const { check, validationResult } = require('express-validator');

const { requireAuth } = require("../auth");

router.use(requireAuth);

const asyncHandler = handler => (req, res, next) => handler(req, res, next).catch(next)

function tweetNotFoundError(tweetId) {
    const error = new Error();
    error.title = 'Tweet not found';
    error.status = 404;
    return error;
}

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        return next(err);
    }
    next();
};

router.get("/", asyncHandler(async (req, res, next) => {
    let tweets = await Tweet.findAll();
    res.json({ tweets });
}));

router.get("/:id", asyncHandler(async (req, res, next) => {
    let tweet = await Tweet.findByPk(req.params.id);
    if (tweet) {
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(req.params.id))
    }
}));

router.post('/', [
    check('message').exists(),
    check('message').isLength({ max: 270 })
], handleValidationErrors, asyncHandler(async (req, res, next) => {
    const body = req.body;
    let tweet = await Tweet.create({ message: body.message })
    res.json({ tweet })

}))

router.put('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    let tweet = await Tweet.findByPk(req.params.id);
    let updatedTweet = await tweet.update({ message: req.body.message })
    if (updatedTweet) {
        res.json({ updatedTweet })
    } else {
        next(tweetNotFoundError(req.params.id))
    }
}))

router.delete('/:id(\\d+)', asyncHandler(async (req, res) => {
    let tweet = await Tweet.findByPk(req.params.id);
    if (tweet) {
        await tweet.destroy();
        res.status(204).send();
    } else {
        next(tweetNotFoundError(req.params.id))
    }
}))

module.exports = router;
