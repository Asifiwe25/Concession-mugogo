const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'mugogo_erp',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🗄️  Database connected')
  }
})

pool.on('error', (err) => {
  console.error('Database pool error:', err)
})

const query = (text, params) => pool.query(text, params)

const getClient = () => pool.connect()

module.exports = { query, getClient, pool }
