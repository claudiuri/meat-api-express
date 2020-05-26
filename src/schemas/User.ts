import { Schema, model, Document, Model, HookNextFunction } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  cpf: string;
  gender: string;
}

export interface UserModel extends Model<User> {}

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
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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

UserSchema.methods.matches = function(password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

const hashPassword = (obj: User, next: HookNextFunction) => {
  bcrypt
    .hash(obj.password, 10)
    .then(hash => {
      obj.password = hash;
      next();
    })
    .catch(next);
};

const saveMiddleware = function(this: any, next: HookNextFunction) {
  const user: User = this;
  if (!user.isModified('password')) {
    next();
  } else {
    hashPassword(user, next);
  }
};

UserSchema.pre('save', saveMiddleware);

export const User = model<User, UserModel>('User', UserSchema);
