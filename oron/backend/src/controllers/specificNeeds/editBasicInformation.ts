import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { SpecificNeedsBasicInformation } from 'orm/entities/SpecificNeedsForm/BasicInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editBasicInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  let {
    participant_first_name,
    participant_last_name,
    participant_father_name,
    participant_mother_name,
    gender,
    date_of_birth,
    father_mobile_number,
    mother_mobile_number,
    home_address,
    basic_information_id,
  } = req.body;
  const basicInformationRepository = getRepository(SpecificNeedsBasicInformation);

  try {
    const basicInformation = await basicInformationRepository.findOne({ where: { id: basic_information_id } });

    if (basicInformation) {
      const newBasicInformation = new SpecificNeedsBasicInformation();
      // Preserve existing values if not provided in request
      participant_first_name = participant_first_name ?? basicInformation.participant_first_name;
      participant_last_name = participant_last_name ?? basicInformation.participant_last_name;
      participant_father_name = participant_father_name ?? basicInformation.participant_father_name;
      participant_mother_name = participant_mother_name ?? basicInformation.participant_mother_name;
      gender = gender ?? basicInformation.gender;
      date_of_birth = date_of_birth ?? basicInformation.date_of_birth;
      father_mobile_number = father_mobile_number ?? basicInformation.father_mobile_number;
      mother_mobile_number = mother_mobile_number ?? basicInformation.mother_mobile_number;
      home_address = home_address ?? basicInformation.home_address;

      newBasicInformation.participant_first_name = participant_first_name;
      newBasicInformation.participant_last_name = participant_last_name;
      newBasicInformation.participant_father_name = participant_father_name;
      newBasicInformation.participant_mother_name = participant_mother_name;
      newBasicInformation.gender = gender;
      newBasicInformation.date_of_birth = date_of_birth;
      newBasicInformation.father_mobile_number = father_mobile_number;
      newBasicInformation.mother_mobile_number = mother_mobile_number;
      newBasicInformation.home_address = home_address;

      await basicInformationRepository.update({ id: basicInformation.id }, newBasicInformation);
      return res.customSuccess(200, 'Basic Information successfully updated.', newBasicInformation);
    } else {
      const customError = new CustomError(400, 'General', 'Basic Information not found', [
        `Basic Information does not exist`,
      ]);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
