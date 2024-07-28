var express = require('express');
var router = express.Router();
require('../models/connection');
const Tweet = require('../models/tweets');
const User = require('../models/users')
const { checkBody } = require('../modules/checkBody')

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

module.exports = router;