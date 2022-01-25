import { Mongoose } from 'mongoose';
import { database } from '../config';

export async function connect(mongoose: Mongoose) {
  const uri = `mongodb${database.srv === 'true' ? '+srv' : ''}://${
    database.user ? `${database.user}:${database.password}@` : ''
  }${database.host}${database.port ? `:${database.port}` : ''}/${
    database.database
  }${database.authSource ? `?authSource=${database.authSource}` : ''}`;
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (exception) {
    console.log(`Exception while connecting to MongoDB: ${exception}`);
  }
}

export * from './models/Price';
export * from './models/Token';
