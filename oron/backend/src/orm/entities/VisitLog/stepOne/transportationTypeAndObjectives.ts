import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Status } from 'types/genericEnums';
import { User } from '../../User';
import { VisitFullForm } from '../visitFullForm';
import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';

@Entity('transportation_type_and_objectives')
export class TransportationTypeAndObjectives {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json', nullable: true })
  transportation_type_details: {
    whereWasDroppedOff?: string;
    whoDroppedOff?: string;
    transportationStartTime?: string;
    transportationEndTime?: string;
    startLocation?: string;
    endingLocation?: string;
    totalTransportationTime?: string;
  };

  @Column({ type: 'json', nullable: true })
  transportation_safety_objectives: {
    objective?: string;
    objective_option?: string;
  }[];

  @Column({ type: 'json', nullable: true })
  unusual_occurrences: {
    hasUnusualOccurrence?: boolean;
    vehiclePulledOverDueToBehavior?: boolean;
    vehiclePulledOverToAttendToNeeds?: boolean;
    trafficOnWay?: boolean;
    other?: {
      selected?: boolean;
      explanation?: string;
    };
  };

  @Column({ type: 'json', nullable: true })
  traffic_sign_recognition: {
    redLightIdentification: {
      identified: boolean;
      option_picked: string;
    };
    yellowLightIdentification: {
      identified: boolean;
      option_picked: string;
    };
    greenLightIdentification: {
      identified: boolean;
      option_picked: string;
    };
    pedestrianCrosswalk: {
      identified: boolean;
      option_picked: string;
    };
    pedestrianSignals: {
      identified: boolean;
      option_picked: string;
    };
  };

  @Column({ type: 'json', nullable: true })
  directional_concepts: {
    indicatedCorrectTurnsToMake: {
      identified: boolean;
      option_picked: string;
    };
    landmarkIdentification: {
      identified: boolean;
      option_picked: string;
    };
    streetAddressIdentification: {
      identified: boolean;
      option_picked: string;
    };
    destinationIdentification: {
      identified: boolean;
      option_picked: string;
    };
    destinationAddressRecall: {
      identified: boolean;
      option_picked: string;
    };
  };

  @Column({ nullable: true })
  treatment_plan_id: string;

  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentFullPlan: TreatmentFullPlan;

  @Column({ nullable: true })
  visit_full_form_id: string;

  @ManyToOne(() => VisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: VisitFullForm;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({ nullable: true })
  account_id: string;

  @Column({ nullable: true })
  registered_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  user: User;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
