import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { CJISFullForm } from 'orm/entities/CJISForm/cjisFullForm';
import { EmployeePersonalInformation } from 'orm/entities/EmployeeDemographicForm/personalInformation';
import { FluFullForm } from 'orm/entities/FluForm/fluFullForm';
import { HepatitisBFullForm } from 'orm/entities/HepatitisBForm/HepatitisFullForm';
import { I9Form } from 'orm/entities/i9Form/i9form';
import { MMRFullForm } from 'orm/entities/MMRVaccineForm/mmrFullForm';
import { PneumococcalVaccinationFullForm } from 'orm/entities/PneumoccalVaccinationForm/pneumococcalFullForm';
import { ReferenceForm } from 'orm/entities/ReferenceForm/reference';
import { TuberculosisFullForm } from 'orm/entities/Tuberculosis-MantouxForm/tuberculosisFullForm';
import { Role, UserStatus } from 'orm/entities/types';
import { User } from 'orm/entities/User';
import { UserBioData } from 'orm/entities/userBioData';
import { VaricellaFullForm } from 'orm/entities/VaricellaVaccineForm/varicellaFullForm';
import { Status } from 'types/genericEnums';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const fetchUsers = async (req: Request, res: Response, next: NextFunction) => {
  const userRepository = getRepository(User);
  const userBioDataRepository = getRepository(UserBioData);
  const employeeDemographicRepository = getRepository(EmployeePersonalInformation);
  const fluFullFormRepository = getRepository(FluFullForm);
  const hepatitisBFullFormRepository = getRepository(HepatitisBFullForm);
  const i9FormRepository = getRepository(I9Form);
  const mmrFullFormRepository = getRepository(MMRFullForm);
  const pneumococcalVaccinationFullFormRepository = getRepository(PneumococcalVaccinationFullForm);
  const tuberculosisFullFormRepository = getRepository(TuberculosisFullForm);
  const varicellaFullFormRepository = getRepository(VaricellaFullForm);
  const referenceFormRepository = getRepository(ReferenceForm);
  const cjisFullFormRepository = getRepository(CJISFullForm);
  const size = Number(req.query.size) || 5;
  const page = Number(req.query.page) || 1;
  const roleFilter = req.query.role as string | undefined;
  const statusFilter = req.query.status as string | undefined;

  try {
    // Build where clause based on role and status filters
    let whereClause: any = {};

    // Apply role filter
    if (roleFilter === 'all') {
      // Return all users (no role filter)
      whereClause = {};
    } else if (roleFilter === 'CLIENT_MANAGER') {
      whereClause = { role: Role.CLIENT_MANAGER };
    } else if (roleFilter === 'ADMINISTRATOR') {
      whereClause = { role: Role.ADMINISTRATOR };
    } else if (roleFilter === 'EMPLOYEE_MANAGER') {
      whereClause = { role: Role.EMPLOYEE_MANAGER };
    } else {
      // Default: return STANDARD users only (backward compatible)
      whereClause = { role: Role.STANDARD };
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'ACTIVE') {
        whereClause.status = UserStatus.ACTIVE;
      } else if (statusFilter === 'INACTIVE') {
        whereClause.status = UserStatus.INACTIVE;
      } else if (statusFilter === 'DISENGAGED') {
        whereClause.status = UserStatus.DISENGAGED;
      }
    }

    const [users, total] = await userRepository.findAndCount({
      where: whereClause,
      order: { created_at: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    const usersData = [];
    let userDump = {};

    if (users.length === 0) {
      return res.customSuccess(200, 'No users found.', { usersData: [], total: 0, page, size });
    }
    if (users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userBioData = await userBioDataRepository.findOne({
          where: { user_id: user.id },
        });
        const employeeDemographicInformation = await employeeDemographicRepository.findOne({
          where: { user_id: user.id },
        });
        const fluFullForm = await fluFullFormRepository.findOne({ where: { user_id: user.id } });
        const hepatitisBFullForm = await hepatitisBFullFormRepository.findOne({
          where: { user_id: user.id },
        });
        const i9Form = await i9FormRepository.findOne({ where: { owner: user.id } });
        const mmrFullForm = await mmrFullFormRepository.findOne({ where: { user_id: user.id } });
        const pneumococcalVaccinationFullForm = await pneumococcalVaccinationFullFormRepository.findOne({
          where: { user_id: user.id },
        });
        const tuberculosisFullForm = await tuberculosisFullFormRepository.findOne({ where: { owner: user.id } });
        const varicellaFullForm = await varicellaFullFormRepository.findOne({ where: { user_id: user.id } });
        const referenceForm = await referenceFormRepository.findOne({ where: { user_id: user.id } });
        const cjisFullForm = await cjisFullFormRepository.findOne({ where: { user_id: user.id } });
        const awaitingApprovalForm = {};
        const formsData = {};
        const approvedForms = {};
        const inprogressForms = {};

        userBioData?.status === Status.IN_PROGRESS ? (inprogressForms['userBioData'] = userBioData) : null;

        employeeDemographicInformation?.status === Status.IN_PROGRESS
          ? (inprogressForms['employeeDemographicInformation'] = employeeDemographicInformation)
          : null;
        fluFullForm?.status === Status.IN_PROGRESS ? (inprogressForms['fluFullForm'] = fluFullForm) : null;

        hepatitisBFullForm?.status === Status.IN_PROGRESS
          ? (inprogressForms['hepatitisBFullForm'] = hepatitisBFullForm)
          : null;

        i9Form?.status === Status.IN_PROGRESS ? (inprogressForms['i9Form'] = i9Form) : null;

        mmrFullForm?.status === Status.IN_PROGRESS ? (inprogressForms['mmrFullForm'] = mmrFullForm) : null;

        pneumococcalVaccinationFullForm?.status === Status.IN_PROGRESS
          ? (inprogressForms['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm)
          : null;

        tuberculosisFullForm?.status === Status.IN_PROGRESS
          ? (inprogressForms['tuberculosisFullForm'] = tuberculosisFullForm)
          : null;

        varicellaFullForm?.status === Status.IN_PROGRESS
          ? (inprogressForms['varicellaFullForm'] = varicellaFullForm)
          : null;

        referenceForm?.status === Status.IN_PROGRESS ? (inprogressForms['referenceForm'] = referenceForm) : null;

        cjisFullForm?.status === Status.IN_PROGRESS ? (inprogressForms['cjisFullForm'] = cjisFullForm) : null;

        userBioData?.status === Status.APPROVED ? (approvedForms['userBioData'] = userBioData) : null;
        employeeDemographicInformation?.status === Status.APPROVED
          ? (approvedForms['employeeDemographicInformation'] = employeeDemographicInformation)
          : null;
        fluFullForm?.status === Status.APPROVED ? (approvedForms['fluFullForm'] = fluFullForm) : null;
        hepatitisBFullForm?.status === Status.APPROVED
          ? (approvedForms['hepatitisBFullForm'] = hepatitisBFullForm)
          : null;
        i9Form?.status === Status.APPROVED ? (approvedForms['i9Form'] = i9Form) : null;
        mmrFullForm?.status === Status.APPROVED ? (approvedForms['mmrFullForm'] = mmrFullForm) : null;
        pneumococcalVaccinationFullForm?.status === Status.APPROVED
          ? (approvedForms['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm)
          : null;
        tuberculosisFullForm?.status === Status.APPROVED
          ? (approvedForms['tuberculosisFullForm'] = tuberculosisFullForm)
          : null;
        varicellaFullForm?.status === Status.APPROVED ? (approvedForms['varicellaFullForm'] = varicellaFullForm) : null;

        referenceForm?.status === Status.APPROVED ? (approvedForms['referenceForm'] = referenceForm) : null;

        cjisFullForm?.status === Status.APPROVED ? (approvedForms['cjisFullForm'] = cjisFullForm) : null;

        userBioData?.status === Status.AWAITING_APPROVAL ? (awaitingApprovalForm['userBioData'] = userBioData) : null;
        employeeDemographicInformation?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['employeeDemographicInformation'] = employeeDemographicInformation)
          : null;
        fluFullForm?.status === Status.AWAITING_APPROVAL ? (awaitingApprovalForm['fluFullForm'] = fluFullForm) : null;
        hepatitisBFullForm?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['hepatitisBFullForm'] = hepatitisBFullForm)
          : null;
        i9Form?.status === Status.AWAITING_APPROVAL ? (awaitingApprovalForm['i9Form'] = i9Form) : null;
        mmrFullForm?.status === Status.AWAITING_APPROVAL ? (awaitingApprovalForm['mmrFullForm'] = mmrFullForm) : null;
        pneumococcalVaccinationFullForm?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm)
          : null;
        tuberculosisFullForm?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['tuberculosisFullForm'] = tuberculosisFullForm)
          : null;
        varicellaFullForm?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['varicellaFullForm'] = varicellaFullForm)
          : null;
        referenceForm?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['referenceForm'] = referenceForm)
          : null;
        cjisFullForm?.status === Status.AWAITING_APPROVAL
          ? (awaitingApprovalForm['cjisFullForm'] = cjisFullForm)
          : null;

        if (!userBioData) {
          formsData['userBioData'] = userBioData;
        }
        if (!employeeDemographicInformation) {
          formsData['employeeDemographicInformation'] = employeeDemographicInformation;
        }
        if (!fluFullForm) {
          formsData['fluFullForm'] = fluFullForm;
        }
        if (!hepatitisBFullForm) {
          formsData['hepatitisBFullForm'] = hepatitisBFullForm;
        }
        if (!i9Form) {
          formsData['i9Form'] = i9Form;
        }
        if (!mmrFullForm) {
          formsData['mmrFullForm'] = mmrFullForm;
        }
        if (!pneumococcalVaccinationFullForm) {
          formsData['pneumococcalVaccinationFullForm'] = pneumococcalVaccinationFullForm;
        }
        if (!tuberculosisFullForm) {
          formsData['tuberculosisFullForm'] = tuberculosisFullForm;
        }
        if (!varicellaFullForm) {
          formsData['varicellaFullForm'] = varicellaFullForm;
        }
        if (!referenceForm) {
          formsData['referenceForm'] = referenceForm;
        }
        if (!cjisFullForm) {
          formsData['cjisFullForm'] = cjisFullForm;
        }

        userDump = {
          ...user,
          not_started: Object.keys(formsData).length,
          awaiting_approval: Object.keys(awaitingApprovalForm).length,
          approved: Object.keys(approvedForms).length,
          in_progress: Object.keys(inprogressForms).length,
        };
        usersData.push(userDump);
      }
    }
    return res.customSuccess(200, 'Users successfully fetched.', { usersData, total, page, size });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
