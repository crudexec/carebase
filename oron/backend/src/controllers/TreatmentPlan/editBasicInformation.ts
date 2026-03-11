import { Request, Response, NextFunction } from 'express';
import { getConnection } from 'typeorm';
import { TreatmentBasicInformation } from 'orm/entities/TreatmentPlan/basicInformation';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editTreatmentBasicInformation = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.startTransaction();
    const form_id = req.params.form_id;
    let {
      participant_first_name,
      participant_last_name,
      participant_father_name,
      participant_mother_name,
      father_mobile_number,
      mother_mobile_number,
      address_street_information,
      country,
      state,
      city,
      county,
      apartment_number,
      zip_code,
      implementation_start_date,
      implementation_stop_date,
      participant_background_information,
      behavior_intervention_protocol,
      transport_requirements_and_recommendations,
      statement_of_family_strength_and_resources,
      tp_implemented_by,
      tp_type,
      requires_data_collection,
      meeting_attendance,
      introduction,
    } = req.body;
    const basicInformationRepository = connection.getRepository(TreatmentBasicInformation);

    const alreadyExistingBasicInformation = await basicInformationRepository.findOne({
      where: { id: form_id },
    });

    if (!alreadyExistingBasicInformation) {
      const customError = new CustomError(404, 'General', `Basic Information not found`, [
        'Basic Information not found.',
      ]);
      return next(customError);
    }

    participant_first_name = participant_first_name ?? alreadyExistingBasicInformation.participant_first_name;
    participant_last_name = participant_last_name ?? alreadyExistingBasicInformation.participant_last_name;
    participant_father_name = participant_father_name ?? alreadyExistingBasicInformation.participant_father_name;
    participant_mother_name = participant_mother_name ?? alreadyExistingBasicInformation.participant_mother_name;
    father_mobile_number = father_mobile_number ?? alreadyExistingBasicInformation.father_mobile_number;
    mother_mobile_number = mother_mobile_number ?? alreadyExistingBasicInformation.mother_mobile_number;
    address_street_information =
      address_street_information ?? alreadyExistingBasicInformation.address_street_information;
    country = country ?? alreadyExistingBasicInformation.country;
    state = state ?? alreadyExistingBasicInformation.state;
    city = city ?? alreadyExistingBasicInformation.city;
    apartment_number = apartment_number ?? alreadyExistingBasicInformation.apartment_number;
    zip_code = zip_code ?? alreadyExistingBasicInformation.zip_code;
    implementation_start_date = implementation_start_date ?? alreadyExistingBasicInformation.implementation_start_date;
    implementation_stop_date = implementation_stop_date ?? alreadyExistingBasicInformation.implementation_stop_date;
    participant_background_information =
      participant_background_information ?? alreadyExistingBasicInformation.participant_background_information;
    behavior_intervention_protocol =
      behavior_intervention_protocol ?? alreadyExistingBasicInformation.behavior_intervention_protocol;
    transport_requirements_and_recommendations =
      transport_requirements_and_recommendations ??
      alreadyExistingBasicInformation.transport_requirements_and_recommendations;
    county = county ?? alreadyExistingBasicInformation.county;
    statement_of_family_strength_and_resources =
      statement_of_family_strength_and_resources ??
      alreadyExistingBasicInformation.statement_of_family_strength_and_resources;

    tp_implemented_by = tp_implemented_by ?? alreadyExistingBasicInformation.tp_implemented_by;
    tp_type = tp_type ?? alreadyExistingBasicInformation.tp_type;
    requires_data_collection = requires_data_collection ?? alreadyExistingBasicInformation.requires_data_collection;
    meeting_attendance = meeting_attendance ?? alreadyExistingBasicInformation.meeting_attendance;
    introduction = introduction ?? alreadyExistingBasicInformation.introduction;

    const newBasicInformation = new TreatmentBasicInformation();

    newBasicInformation.participant_first_name = participant_first_name;
    newBasicInformation.participant_last_name = participant_last_name;
    newBasicInformation.participant_father_name = participant_father_name;
    newBasicInformation.participant_mother_name = participant_mother_name;
    newBasicInformation.father_mobile_number = father_mobile_number;
    newBasicInformation.mother_mobile_number = mother_mobile_number;
    newBasicInformation.address_street_information = address_street_information;
    newBasicInformation.country = country;
    newBasicInformation.state = state;
    newBasicInformation.city = city;
    newBasicInformation.apartment_number = apartment_number;
    newBasicInformation.zip_code = zip_code;
    newBasicInformation.implementation_start_date = implementation_start_date;
    newBasicInformation.implementation_stop_date = implementation_stop_date;
    newBasicInformation.participant_background_information = participant_background_information;
    newBasicInformation.behavior_intervention_protocol = behavior_intervention_protocol;
    newBasicInformation.transport_requirements_and_recommendations = transport_requirements_and_recommendations;
    newBasicInformation.county = county;
    newBasicInformation.statement_of_family_strength_and_resources = statement_of_family_strength_and_resources;
    newBasicInformation.tp_implemented_by = tp_implemented_by;
    newBasicInformation.tp_type = tp_type;
    newBasicInformation.requires_data_collection = requires_data_collection;
    newBasicInformation.meeting_attendance = meeting_attendance;
    newBasicInformation.introduction = introduction;

    await basicInformationRepository.update(form_id, newBasicInformation);
    await queryRunner.commitTransaction();
    return res.customSuccess(200, 'Basic Information successfully created.', newBasicInformation);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Treatment Basic Information', null, err);
    return next(customError);
  } finally {
    await queryRunner.release();
  }
};
