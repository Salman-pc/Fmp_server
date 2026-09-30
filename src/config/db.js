import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './env.js';

// Set default DNS order & DNS servers
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if custom DNS assignment fails
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    
    // If Atlas SRV DNS query fails on local Wi-Fi/ISP, try direct non-SRV shard connection string
    if (config.mongoUri.includes('mongodb+srv://')) {
      console.log('⚠️ DNS SRV query refused by local ISP. Attempting direct non-SRV connection to Atlas cluster shards...');
      try {
        // Convert mongodb+srv://user:pass@cluster0.subdomain.mongodb.net/dbname to direct shard string
        const match = config.mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(.*)/);
        if (match) {
          const [, user, pass, host, dbName] = match;
          const clusterPrefix = host.split('.')[0];
          const clusterDomain = host.substring(clusterPrefix.length + 1);
          const shard0 = `${clusterPrefix}-shard-00-00.${clusterDomain}:27017`;
          const shard1 = `${clusterPrefix}-shard-00-01.${clusterDomain}:27017`;
          const shard2 = `${clusterPrefix}-shard-00-02.${clusterDomain}:27017`;
          
          const directUri = `mongodb://${user}:${pass}@${shard0},${shard1},${shard2}/${dbName}?ssl=true&replicaSet=atlas-${clusterPrefix.slice(-5)}-shard-0&authSource=admin&retryWrites=true&w=majority`;
          
          const directConn = await mongoose.connect(directUri);
          console.log(`[MongoDB Direct Atlas Connected]: ${directConn.connection.host}/${directConn.connection.name}`);
          return;
        }
      } catch (directErr) {
        console.error(`[MongoDB Direct Atlas Connection Failed]: ${directErr.message}`);
      }

      // Final fallback to local MongoDB instance
      console.log('⚠️ Attempting fallback to local MongoDB instance (mongodb://127.0.0.1:27017/geocircle)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/geocircle');
        console.log(`[MongoDB Fallback Connected]: ${localConn.connection.host}/${localConn.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`[MongoDB Local Fallback Failed]: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};
