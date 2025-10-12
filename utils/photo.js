const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./appError');

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const sharpResizeAsync = async (file, folder, filename, width, height) => {
    await sharp(file.buffer)
        .resize(width, height)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/${folder}/${filename}`);
};

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}.${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const uploadFromStorage = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

module.exports = {
    sharpResizeAsync,
    uploadFromStorage
};
