const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

const getAllToursAsync = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .fields()
        .paginate();

    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
});

const getTourAsync = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            tour
        }
    });
});

const updateTourAsync = catchAsync(async (req, res, next) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedTour) {
        return next(new AppError('No tour found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            updatedTour
        }
    });
});

const deleteTourAsync = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID.', 404));
    }

    res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: null
    });
});

const createTourAsync = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

const getTourStatsAsync = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                num: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

const getMonthlyPlanAsync = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const toursPerMonth = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tour: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            toursPerMonth
        }
    });
});

module.exports = {
    getAllToursAsync,
    getTourAsync,
    createTourAsync,
    updateTourAsync,
    deleteTourAsync,
    aliasTopTours,
    getTourStatsAsync,
    getMonthlyPlanAsync
};
