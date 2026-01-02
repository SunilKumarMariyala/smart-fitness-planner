import mysql from 'mysql2/promise';

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName]?.trim() === '');

if (missingVars.length > 0) {
  console.error('❌ Missing or empty required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file in the backend directory.');
  console.error('Required variables:');
  console.error('  DB_HOST=localhost');
  console.error('  DB_USER=root');
  console.error('  DB_PASSWORD=your_mysql_password  <-- Make sure this is set!');
  console.error('  DB_NAME=smart_fitness');
  console.error('  PORT=3000');
}

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_fitness',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup (async, won't block)
db.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'smart_fitness'}`);
    connection.release();
  })
  .catch((error) => {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('Access denied')) {
      console.error('\n   🔑 Authentication failed. This usually means:');
      console.error('   1. The MySQL password in your .env file is incorrect or empty');
      console.error('   2. The DB_USER in .env doesn\'t match your MySQL username');
      console.error('   3. The .env file has extra spaces or quotes around values');
      console.error('\n   📝 Check your .env file:');
      console.error('   - DB_PASSWORD=your_actual_password (NO quotes, NO spaces around =)');
      console.error('   - Example: DB_PASSWORD=mypassword123');
      console.error('   - NOT: DB_PASSWORD="mypassword123" or DB_PASSWORD = mypassword123');
      if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.trim() === '') {
        console.error('\n   ⚠️  DB_PASSWORD appears to be empty in your .env file!');
      }
    } else if (error.message.includes('Unknown database')) {
      console.error(`\n   📦 The database "${process.env.DB_NAME || 'smart_fitness'}" does not exist.`);
      console.error('   Run this in MySQL: CREATE DATABASE smart_fitness;');
    } else {
      console.error('   Please check your .env file and ensure MySQL is running.');
    }
  });
