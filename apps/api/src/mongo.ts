import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI!;
  client = new MongoClient(uri, { socketTimeoutMS: 60_000 });
  await client.connect();
  db = client.db();
  console.log(`Connected to Mongo! Database name: "${db.databaseName}"`);
}

export function getDb(): Db {
  if (!db) {
    throw new Error(
      "Mongo has not been initialized.  Did you forget to call connectMongo() first?"
    );
  }
  return db;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error(
      "Mongo has not been initialized. Did you forget to call connectMongo() first?"
    );
  }
  return client;
}
