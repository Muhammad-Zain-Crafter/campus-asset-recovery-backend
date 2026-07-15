import multer from 'multer';

// diskstorage needs 2 things destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp'); // cb(error, value)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});

export const upload = multer({ storage: storage });