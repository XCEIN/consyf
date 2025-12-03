import mysql from 'mysql2/promise';

const config: any = {
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'consyfnew',
  waitForConnections: true,
  connectionLimit: 10,
};

// Use socket if available (XAMPP), otherwise use host/port
if (process.env.MYSQL_SOCKET) {
  config.socketPath = process.env.MYSQL_SOCKET;
} else {
  config.host = process.env.MYSQL_HOST || '127.0.0.1';
  config.port = Number(process.env.MYSQL_PORT || 3306);
}

export const pool = mysql.createPool(config);
