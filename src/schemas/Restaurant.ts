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
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
    },
  },
  menu: {
    type: [menuSchema],
    required: false,
    select: false,
  },
});

restSchema.index({ location: '2dsphere' });

export const Restaurant = model<Restaurant>('Restaurant', restSchema);
