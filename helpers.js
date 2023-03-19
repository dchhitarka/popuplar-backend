const multer = require('multer');
//const path = require('path');
exports.baseUrl = "http://localhost:5000/"
exports.postTypes = [
  "BLOG",
  "POST",
  "POLL",
];

exports.storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
      cb(null, file.originalname); // + path.extname(file.originalname)
  }
});

const imageFilter = function(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|webp|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
exports.imageFilter = imageFilter;