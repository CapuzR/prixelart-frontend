import { ObjectId } from 'mongodb';

export interface Subscriber {
  _id?: ObjectId;
  email: string;
  source: string;
  interests: string[];
  status: 'active' | 'unsubscribed';
  lastInteraction?: Date;
  convertedToUser?: boolean;
  createdAt: Date;
}
