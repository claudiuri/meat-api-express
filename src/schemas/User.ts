import { Schema, model, Document } from 'mongoose';

export interface UserInterface extends Document {
  name: string;
  email: string;
  password: string;
  cpf: string;
  gender: string;
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 80,
    minlength: 3,
  },
  email: {
    type: String,
    unique: true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,  /* eslint-disable-line */
    required: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  gender: {
    type: String,
    required: false,
    enum: ['Male', 'Female'],
  },
  cpf: {
    type: String,
    required: false,
    // validate: {
    //   validator: validateCPF,
    //   message: '{PATH}: Invalid CPF ({VALUE})',
    // },
  },
});

export default model<UserInterface>('User', UserSchema);
