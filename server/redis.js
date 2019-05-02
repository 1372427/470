const redis = require('redis'); // pull in the redis module

let redisClient; // variable to hold redis connection that we can pass to other parts of code

// function to connect with the redisURL and redisPASS (passed in from the app.js)
const connect = (redisURL, redisPASS) => {
    // create a new redis client for the port and hostname/address
  redisClient = redis.createClient(redisURL.port, redisURL.hostname);

    // if there is a password, (normally means not running locally)
  if (redisPASS) {
    redisClient.auth(redisPASS); // authenticate using the password
  }

    // Asynchronous event handlers for redis

    // when connected successfully
  redisClient.on('connect', () => {
    console.log('redis connected');
  });

    // if there is an error
  redisClient.on('error', (err) => {
    console.log('could not connect');
    throw err;
  });

    // if the redis connection is lost or closed
  redisClient.on('end', (err) => {
    console.dir(err);
    console.log('disconnected from redis');
  });
};

// accessor for the redisclient.
// Since the redisClient variable will be undefined until
// the connect function is called,
// we don't want to just make the client
// public because it would return
// undefined once and not check again.
// If we do it this way, then the client will get returned
const getClient = () => redisClient;

module.exports.connect = connect;
module.exports.getClient = getClient;
