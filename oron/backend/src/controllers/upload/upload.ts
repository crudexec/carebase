import { CustomError } from 'utils/response/custom-error/CustomError';
import { parseFile } from 'utils/upload/fileParser';

export const uploadDocument = async (req: any, res: any, next: any) => {
  try {
    const parsedFile = await parseFile(req);
    return res.customSuccess(200, 'Document successfully uploaded.', parsedFile);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
