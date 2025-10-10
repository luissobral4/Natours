const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach((key) => {
        if (allowedFields.includes(key)) newObj[key] = obj[key];
    });

    return newObj;
};

const getAllUsers = factory.getAll(User);

const getUser = factory.getOne(User);

const createUser = factory.createOne(User);

const updateUser = factory.updateOne(User);

const deleteUser = factory.deleteOne(User);

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for updating password. Please use /updatePassword route.',
                400
            )
        );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    });
});

const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe,
    deleteMe
};
