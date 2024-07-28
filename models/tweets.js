const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    date: Date,
    content: String,
    hashtag: Array,
    likedBy: Array,
   });

   const Tweet = mongoose.model('tweets', tweetSchema)

   module.exports = Tweet;