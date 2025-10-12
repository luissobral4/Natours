const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            default: 4.5,
            min: [1, 'A review rating must be above 1.'],
            max: [5, 'A review rating must be below 5.']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user.']
        },
        review: {
            type: String,
            required: [true, 'Review can not be empy.']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name'
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    let ratingsAverage = 4.5;
    let ratingsQuantity = 0;

    if (stats.length > 0) {
        ratingsQuantity = stats[0].nRatings;
        ratingsAverage = stats[0].avgRating;
    }

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: ratingsQuantity,
        ratingsAverage: ratingsAverage
    });
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
