const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const getAllBookings = factory.getAll(Booking);

const getBooking = factory.getOne(Booking);

const createBooking = factory.createOne(Booking);

const updateBooking = factory.updateOne(Booking);

const deleteBooking = factory.deleteOne(Booking);

const getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
        return next(new AppError('No document found with that ID.', 404));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,

        line_items: [
            {
                price_data: {
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`
                        ]
                    },
                    unit_amount: tour.price * 100,
                    currency: 'usd'
                },
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        session
    });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) next();

    const newBooking = await Booking.create({ tour, user, price });

    res.status(201).json({
        status: 'success',
        data: {
            data: newBooking
        }
    });
});

module.exports = {
    getAllBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    getCheckoutSession,
    createBookingCheckout
};
