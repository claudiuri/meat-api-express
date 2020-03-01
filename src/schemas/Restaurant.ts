import { Document, Schema, model } from 'mongoose';

export interface MenuItem extends Document {
  name: string;
  price: number;
}

export interface Restaurant extends Document {
  name: string;
  menu: MenuItem[];
}

const menuSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const restSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  menu: {
    type: [menuSchema],
    required: false,
    select: false,
  },
});

export const Restaurant = model<Restaurant>('Restaurant', restSchema);
