const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//file upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 *1024}, //limit of file size 5 mb.
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if(extname && mimetype){
            return cb(null, true);
        } else {
            cb(new Error("Only, PDF, JPG, PNG, JPEG files allowed."));
        }

    }
}).fields([
    {name: 'qualificationDocuments.resume', maxCount:1},
    {name: 'qualificationDocuments.professionalLicense', maxCount: 1}
]);


module.exports = upload;