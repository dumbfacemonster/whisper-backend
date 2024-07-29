var express = require('express');
var router = express.Router();
require('../models/connection');
const Tweet = require('../models/tweets');
const User = require('../models/users')
const { checkBody } = require('../modules/checkBody');
const { error } = require('console');

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
/* const pattern = /#[A-z0-9]* /gi
const hashtag = req.body.content.match(pattern);
console.log(hashtag) 

let saveHashtag;
const arrHash = []

if (!hashtag) {
    saveHashtag = [];
}
else {
    saveHashtag = hashtag;

    for (let tag of saveHashtag) {
        newTag = tag.slice(1);
        arrHash.push(newTag)
    }
    saveHashtag = arrHash;
    console.log(saveHashtag)
    
} */
    console.log(req.body)
  User.findOne({token: req.body.author})
  .then(data => {
    const author = data._id;

    const newTweet = new Tweet ({
        author: author,
        date: new Date(),
        content: req.body.content,
        hashtag: req.body.hashtag,
     })
     newTweet.save()
     .then(data => data.populate('author'))
     .then(data => {
        res.json({result: true, newTweet: data, req: req.body})
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

//UPDATE likes of a tweet
router.put('/likes', (req, res) => {
    if (!checkBody(req.body, ['token', '_id'])) {
        res.json({result: false, error: "Missing or empty fields"});
        return;
      }

    Tweet.findById(req.body._id)
    .then(data => {
       console.log(data)
       if (!data.likedBy.some((e) => e === req.body.token)) {
        data.likedBy = [...data.likedBy, req.body.token];
        data.save()
        .then((newData) => {
        res.json({result: true, info: 'added', tweet: newData})
        })
        }
        else {
          data.likedBy = data.likedBy.filter((e) => e !== req.body.token)
          data.save().then((newData) => {
           console.log('deleted')
           res.json({result: true, info: 'deleted', tweet: newData})
        })
        }
    })
})

//GET all trends
router.get('/trends', (req, res) => {
    Tweet.find()
    .then(data => {
        //console.log(data);
        let trends = [];
        let loopTime = data.length;
        for (let i=0; i<loopTime; i++) {
            for (let j=0; j<data[i].hashtag.length; j++) {
                let obj = {};
                if (!trends.some((e) => e.tag === data[i].hashtag[j]
                && !data.some((e) => e.hashtag.includes((f) => f === data[i].hashtag[j] )))) {
                    console.log('false')
                    obj.tag = data[i].hashtag[j];
                    obj.nb = 1;
                    console.log(obj)
                    trends.push(obj)
                    data[i].hashtag.splice(j, 1)
                    //console.log(trends)
                }
                else {
                    console.log('true')
                    const index = trends.findIndex(trend => trend.tag === data[i].hashtag[j]);
                    //console.log(i)
                    trends[index].nb += 1;
                }

            }
        }
        trends = trends.sort((a, b) => b.nb - a.nb);
        trends = trends.splice(0, 10)
        return trends;
    })
    .then(data => {
        res.json({result: true, trends: data})
    })
})

//GET tweets with #
router.get('/trend/:tag', (req, res) => {
    Tweet.find({hashtag: req.params.tag })
    .populate('author')
    .then(data => {
        if (data.length >=1) {
            console.log(data)
            res.json({result: true, tweets: data})
        }
        else {
            res.json({result: false, tweets: data})
        }
    })
})

module.exports = router;