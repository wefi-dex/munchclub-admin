import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null
let db: Db | null = null

// Get the database name from the connection string or use default
const getDatabaseName = (): string => {
  // Try to get from env variable first
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB
  }
  
  // Try to extract from connection string
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (uri) {
    try {
      const url = new URL(uri)
      const dbName = url.pathname.slice(1) || 'munchclub'
      return dbName
    } catch (error) {
      // If URL parsing fails, default to munchclub
      return 'munchclub'
    }
  }
  
  return 'munchclub'
}

export async function getMongoDb(): Promise<Db> {
  if (db) return db
  
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!uri) {
    throw new Error('MONGODB_URI or DATABASE_URL environment variable is not set')
  }
  
  // Reuse client connection
  if (!clientPromise) {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }
      
      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri)
        globalWithMongo._mongoClientPromise = client.connect()
      }
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri)
      clientPromise = client.connect()
    }
  }
  
  const connectedClient = await clientPromise
  const dbName = getDatabaseName()
  db = connectedClient.db(dbName)
  
  return db
}


