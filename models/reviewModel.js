const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
