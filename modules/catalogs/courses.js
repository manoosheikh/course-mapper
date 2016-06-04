var mongoose = require('mongoose');
var slug = require('slug');
var Tag = require('./courseTags.js');

var courseSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  description: {type: String},
  smallDescription: {type: String},
  picture: {type: String},
  video: {type: String},
  settings: {type: mongoose.Schema.Types.Mixed},
  tabsActive: {type: mongoose.Schema.Types.Mixed},
  category: {type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
  managers: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  courseTags: [{type: mongoose.Schema.Types.ObjectId, ref: 'courseTags'}],
  isDeleted: {type: Boolean},
  dateAdded: {type: Date},
  dateUpdated: {type: Date},
  totalEnrollment: {type: Number}
});

// Define indexes
courseSchema.index({
    name: 'text',
    description: 'text',
    smallDescription: 'text'
  },
  {
    name: 'best_match_name',
    weights: {
      name: 10,
      description: 6,
      smallDescription: 4
    }
  });

courseSchema.methods.setSlug = function (cString) {
  this.slug = slug(cString);
};

courseSchema.pre('save', function (next) {
  var now = new Date();

  if (!this.dateAdded) {
    this.dateAdded = now;
  }

  this.dateUpdated = now;

  next();
});

var Course = mongoose.model('courses', courseSchema);

module.exports = Course;