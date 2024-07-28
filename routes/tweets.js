var express = require('express');
var router = express.Router();
require('../models/connection');
const Tweet = require('../models/tweets');
const User = require('../models/users')

// GET all tweets
router.get('/', (req, res) => {
    Tweet.find()
    .populate('author')
    .then(data => {
        if (data) {
        const sortedTweets = data.sort((a, b) => b.date - a.date)
        res.json({result: true, tweets: sortedTweets})
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

  User.findOne({token: req.body.author})
  .then(data => {
    const author = data._id;
    const newTweet = new Tweet ({
        author: author,
        date: new Date(),
        content: req.body.content,
        hashtag: saveHashtag,
     })
     newTweet.save()
     .then(data => data.populate('author'))
     .then(data => {
        res.json({result: true, newTweet: data})
     })
        
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