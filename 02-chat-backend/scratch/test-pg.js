const { Pool } = require('pg');
const parse = require('pg-connection-string').parse;

const connectionString = "postgresql://myuser:mypassword@localhost:5433/chat_db?schema=public";
console.log('Parsed connection string:', parse(connectionString));

const pool = new Pool({ connectionString });
pool.connect((err, client, release) => {
  if (err) {
    console.error('Connection error:', err);
  } else {
    console.log('Connected successfully!');
    release();
  }
  process.exit();
});
