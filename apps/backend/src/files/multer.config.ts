import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadPath = './uploads';
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
      const extension = extname(file.originalname);
      const filename = `${uuidv4()}${extension}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
};
