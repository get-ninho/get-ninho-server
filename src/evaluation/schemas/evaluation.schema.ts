import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { Document, HydratedDocument } from 'mongoose';

export type EvaluationDocument = HydratedDocument<Evaluation>;

@Schema()
export class Evaluation extends Document {
  @Prop({ required: true })
  professional_id: number;

  @Prop({ required: true })
  customer_id: number;

  @Prop({ required: true })
  job_id: number;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  description: string;

  @Prop({
    default: () => moment.tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss'),
  })
  created_at: string;

  @Prop({
    default: () => moment.tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss'),
  })
  updated_at: string;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);

EvaluationSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = moment()
      .tz('America/Sao_Paulo')
      .format('DD/MM/YYYY HH:mm:ss');
  }
  next();
});
