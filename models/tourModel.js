const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      trim: true,
      unique: true,
      maxlength: [40, "A tour name must have less or equal than 40 chars"],
      minlength: [10, "A tour name must contain alteast 10 chars"],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, "A must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a Group SIze"],
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy, medium or difficult",
      },
    },
    ratingsAverage: {
      min: [1, "A rating must have min of 1.0"],
      max: [5, "A rating must have max of 5.0"],
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: "Price should be more than discount price ({VALUE})",
        validator: function (val) {
          return this.price > val;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        date: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// virtual populate reviews without mention in model
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// document middleware: run before save command
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embedding reference into model
// tourSchema.pre("save",  async function (next) {
//   const guidesUserDataPromises = this.guides.map(async guideID => await User.findById(guideID))
//   this.guides = await Promise.all(guidesUserDataPromises);
//   next();
// })

// tourSchema.pre("save", function (next) {
//   console.log('Will save document');
//   next();
// });

// tourSchema.post("save", function (document, next) {
//   console.log('document', JSON.stringify(document));
//   next();
// });

// query middleware
// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

tourSchema.post(/^find/, function (documents, next) {
  // console.log(documents);
  next();
});

// aggregation middleware
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  console.log(this);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
