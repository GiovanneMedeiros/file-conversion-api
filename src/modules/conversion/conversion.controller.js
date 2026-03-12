import {
  getConversionStatus,
  getDownloadPath,
  getUserConversionHistory,
  requestConversion,
} from './conversion.service.js';
import { sendSuccess } from '../../shared/http/response.js';

export async function createConversion(req, res, next) {
  try {
    const conversion = await requestConversion({
      userId: req.user.id,
      fileId: req.body.fileId,
      targetFormat: req.body.targetFormat,
    });

    return sendSuccess(res, 201, {
      message: 'Conversion requested successfully',
      conversion,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getConversionById(req, res, next) {
  try {
    const conversion = await getConversionStatus({
      userId: req.user.id,
      conversionId: req.params.id,
    });

    return sendSuccess(res, 200, conversion);
  } catch (error) {
    return next(error);
  }
}

export async function downloadConvertedFile(req, res, next) {
  try {
    const filePath = await getDownloadPath({
      userId: req.user.id,
      filename: req.params.filename,
    });

    return res.download(filePath);
  } catch (error) {
    return next(error);
  }
}

export async function getMyConversions(req, res, next) {
  try {
    const conversions = await getUserConversionHistory(req.user.id);
    return sendSuccess(res, 200, conversions);
  } catch (error) {
    return next(error);
  }
}
