const mongoose = require('mongoose');
const validate = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name.']
    },
    email: {
        type: String,
        required: [true, 'A user must have an email.'],
        unique: true,
        lowercase: true,
        validate: [validate.isEmail, 'Please provide a valid email.']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'A user must have a password.'],
        minLength: [
            8,
            'A user password must have more or equal than 8 characters.'
        ],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must have a password.'],
        validate: {
            // This only works on CREATE and SAVE!
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords are not the same.'
        }
    },
    passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return jwtTimestamp < changedTimestamp;
    }

    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
