var express = require('express');
var router = express.Router();
require('../models/connection');
const Tweet = require('../models/tweets');

// GET all tweets
router.get('/', (req, res) => {
    Tweet.find()
    .then(data => {
        if (data) {
        res.json({result: true, tweets: data})
        }
        else {
        res.json({result: false});
        }
    })
});

// POST a new tweet
router.post('/', (req, res) => {
const pattern = /#[a-z0-9]*/g
const hashtag = req.body.content.match(pattern);

let saveHashtag;

if (!hashtag) {
    saveHashtag = [];
}
else {
    saveHashtag = hashtag;
    
}

 const newTweet = new Tweet ({
    author: req.body.author,
    date: new Date(),
    content: req.body.content,
    hashtag: saveHashtag,
 })
 
 newTweet.save().then(data => {
    res.json({result: true, newTweet: data})
 })
})

//DELETE a tweet
router.delete('/:tweetId', (req, res) => {
    Tweet.deleteOne({_id: req.params.tweetId})
    .then(() => {
        res.json({result: true})
    })
})

module.exports = router;