import { Schema, model, models, Document } from 'mongoose';

export interface IAbbreviation extends Document {
  name: string;
}

const AbbreviationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default models.Abbreviation || model<IAbbreviation>('Abbreviation', AbbreviationSchema);
