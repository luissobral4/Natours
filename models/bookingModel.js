const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a user.']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, async function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });

    next();
});

const booking = mongoose.model('booking', bookingSchema);

module.exports = booking;
