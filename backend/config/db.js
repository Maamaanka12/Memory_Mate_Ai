const sql = require('mssql');

// const dbConfig = {
//   server: process.env.DB_SERVER || 'localhost',

//   // port: parseInt(process.env.DB_PORT) || 1433,

//   database: process.env.DB_NAME || 'MemoryMateAI',

//   options: {
//     encrypt: process.env.DB_ENCRYPT === 'true',
//     trustServerCertificate:
//       process.env.DB_TRUST_SERVER_CERT !== 'false',

//     trustedConnection: true,

//     enableArithAbort: true,
//   },

//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
// };

const dbConfig = {
  server: process.env.DB_SERVER,

  database: process.env.DB_NAME,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',

    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERT !== 'false',

    enableArithAbort: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

const getPool = async () => {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  console.log('[DB] Connected to MSSQL:', process.env.DB_NAME);
  return pool;
};
const closePool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('[DB] Connection pool closed.');
  }
};
module.exports = { sql, getPool, closePool };