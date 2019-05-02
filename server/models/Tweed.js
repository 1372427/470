const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let TweedModel = {};
// mongoose.Types.ObjectID is a function that converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = name => _.escape(name).trim();

const TweedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  tweed: {
    type: String,
    min: 0,
    required: true,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

TweedSchema.statics.toAPI = doc => ({
  name: doc.name,
  tweed: doc.tweed,
});


TweedSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return TweedModel.find(search).select('name tweed').exec(callback);
};

TweedModel = mongoose.model('Tweed', TweedSchema);

module.exports.TweedModel = TweedModel;
module.exports.TweedSchema = TweedSchema;
