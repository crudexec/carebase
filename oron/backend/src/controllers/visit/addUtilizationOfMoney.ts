import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UtilizationOfMoney } from 'orm/entities/VisitLog/stepTwo/utilizationOfMoney';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { Status } from 'types/genericEnums';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const addUtilizationOfMoney = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    const {
      handing_bills_to_cashier,
      waiting_for_and_receiving_debit_credit_card,
      handing_coins_to_cashier,
      counting_the_change_to_make_sure_it_is_correct,
      handing_debit_credit_card_to_cashier,
      determining_and_handling_the_correct_estimated_amount,
      using_the_dollar_up_program,
      obtaining_and_reviewing_receipt_for_accuracy,
      waiting_for_and_accepting_the_change,
      this_activity_occured_at,
      visit_full_form_id,
    } = req.body;
    const account_id = req.user.account_id;
    const registered_by = req.user.id;

    const visitFullFormRepository = getRepository(VisitFullForm);
    const utilizationOfMoneyRepository = getRepository(UtilizationOfMoney);

    const visitExists = await visitFullFormRepository.findOne({ where: { id: visit_full_form_id, deleted_at: null } });

    if (!visitExists) {
      const customError = new CustomError(404, 'General', `Visit not found`, ['Visit not found.']);
      return next(customError);
    }

    const utilizationOfMoney = new UtilizationOfMoney();

    utilizationOfMoney.handing_bills_to_cashier = handing_bills_to_cashier;
    utilizationOfMoney.waiting_for_and_receiving_debit_credit_card = waiting_for_and_receiving_debit_credit_card;
    utilizationOfMoney.handing_coins_to_cashier = handing_coins_to_cashier;
    utilizationOfMoney.counting_the_change_to_make_sure_it_is_correct = counting_the_change_to_make_sure_it_is_correct;
    utilizationOfMoney.handing_debit_credit_card_to_cashier = handing_debit_credit_card_to_cashier;
    utilizationOfMoney.determining_and_handling_the_correct_estimated_amount =
      determining_and_handling_the_correct_estimated_amount;
    utilizationOfMoney.using_the_dollar_up_program = using_the_dollar_up_program;
    utilizationOfMoney.obtaining_and_reviewing_receipt_for_accuracy = obtaining_and_reviewing_receipt_for_accuracy;
    utilizationOfMoney.waiting_for_and_accepting_the_change = waiting_for_and_accepting_the_change;
    utilizationOfMoney.this_activity_occured_at = this_activity_occured_at;
    utilizationOfMoney.account_id = account_id;
    utilizationOfMoney.status = Status.IN_PROGRESS;
    utilizationOfMoney.registered_by = registered_by;
    utilizationOfMoney.visit_full_form_id = visit_full_form_id;

    const savedUtilizationOfMoney = await utilizationOfMoneyRepository.save(utilizationOfMoney);

    if (savedUtilizationOfMoney) {
      await visitFullFormRepository.update(visit_full_form_id, {
        utilization_of_money_id: savedUtilizationOfMoney.id,
      });
    }

    return res.customSuccess(200, 'Utilization of Money added successfully', savedUtilizationOfMoney);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Adding Utilization of Money', null, err);
    return next(customError);
  }
};
