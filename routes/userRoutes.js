const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signupAsync);

router.post('/login', authController.loginAsync);

router.post('/forgotPassword', authController.forgotPasswordAsync);
router.patch('/resetPassword/:token', authController.resetPasswordAsync);
router.patch(
    '/updatePassword',
    authController.protectAsync,
    authController.updatePasswordAsync
);

router.patch(
    '/updateMe',
    authController.protectAsync,
    userController.updateMeAsync
);
router.delete(
    '/deleteMe',
    authController.protectAsync,
    userController.deleteMeAsync
);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
