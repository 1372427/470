const models = require('../models');

const Tweed = models.Tweed;

const redisUtil = require('../redis.js');


const makerPage = (req, res) => {
  Tweed.TweedModel.find((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), tweeds: docs });
  });
};

let latest = {};

const getUpdates = (req, res) => {
  res.json(latest);
};

redisUtil.getClient().subscribe('updateChannel');

redisUtil.getClient().on('message', (channel, message) => {
  console.log(message)
  latest = JSON.parse(message);
  latest.id = new Date().getTime();
});

module.exports.makerPage = makerPage;
module.exports.getUpdates = getUpdates;