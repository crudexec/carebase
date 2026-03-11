import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UtilizationOfMoney } from 'orm/entities/VisitLog/stepTwo/utilizationOfMoney';
import { JwtPayload } from 'types/JwtPayload';
import { CustomError } from 'utils/response/custom-error/CustomError';

interface RequestWithJwtPayload extends Request {
  req: RequestWithJwtPayload;
  user: JwtPayload;
}

export const editUtilizationOfMoney = async (req: RequestWithJwtPayload, res: Response, next: NextFunction) => {
  try {
    let {
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
      utilization_of_money_id,
    } = req.body;

    const utilizationOfMoneyRepository = getRepository(UtilizationOfMoney);

    const utilizationOfMoneyExists = await utilizationOfMoneyRepository.findOne({
      where: { id: utilization_of_money_id, deleted_at: null },
    });

    if (!utilizationOfMoneyExists) {
      const customError = new CustomError(404, 'General', `Utilization of Money not found`, [
        'Utilization of Money not found.',
      ]);
      return next(customError);
    }

    handing_bills_to_cashier = handing_bills_to_cashier ?? utilizationOfMoneyExists.handing_bills_to_cashier;
    waiting_for_and_receiving_debit_credit_card =
      waiting_for_and_receiving_debit_credit_card ??
      utilizationOfMoneyExists.waiting_for_and_receiving_debit_credit_card;
    handing_coins_to_cashier = handing_coins_to_cashier ?? utilizationOfMoneyExists.handing_coins_to_cashier;
    counting_the_change_to_make_sure_it_is_correct =
      counting_the_change_to_make_sure_it_is_correct ??
      utilizationOfMoneyExists.counting_the_change_to_make_sure_it_is_correct;
    handing_debit_credit_card_to_cashier =
      handing_debit_credit_card_to_cashier ?? utilizationOfMoneyExists.handing_debit_credit_card_to_cashier;
    determining_and_handling_the_correct_estimated_amount =
      determining_and_handling_the_correct_estimated_amount ??
      utilizationOfMoneyExists.determining_and_handling_the_correct_estimated_amount;
    using_the_dollar_up_program = using_the_dollar_up_program ?? utilizationOfMoneyExists.using_the_dollar_up_program;
    obtaining_and_reviewing_receipt_for_accuracy =
      obtaining_and_reviewing_receipt_for_accuracy ??
      utilizationOfMoneyExists.obtaining_and_reviewing_receipt_for_accuracy;
    waiting_for_and_accepting_the_change =
      waiting_for_and_accepting_the_change ?? utilizationOfMoneyExists.waiting_for_and_accepting_the_change;
    this_activity_occured_at = this_activity_occured_at ?? utilizationOfMoneyExists.this_activity_occured_at;

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

    await utilizationOfMoneyRepository.update(utilization_of_money_id, utilizationOfMoney);

    return res.status(200).json({ message: 'Utilization of Money updated successfully' });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Network Error Updating Utilization of Money', null, err);
    return next(customError);
  }
};
