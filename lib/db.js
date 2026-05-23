/*
  Minimal DB adapter that exposes a mysql2/promise-like API
  If `POSTGRES_URL` is set, it uses `pg` under the hood and
  adapts return values to look like mysql2 (i.e. [rows, fields]).
  Otherwise it falls back to `mysql2/promise`.
*/
const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL_PG || process.env.PG_CONNECTION_STRING;

if (pgUrl) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: pgUrl });

  // Convert MySQL-style `?` placeholders to Postgres $1, $2, ...
  function convertPlaceholders(sql, params) {
    if (!params || params.length === 0) return { sql, params };
    let i = 0;
    let out = '';
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    for (let idx = 0; idx < sql.length; idx++) {
      const ch = sql[idx];
      if (ch === "'" && !inDouble && !inBacktick) {
        inSingle = !inSingle;
        out += ch;
        continue;
      }
      if (ch === '"' && !inSingle && !inBacktick) {
        inDouble = !inDouble;
        out += ch;
        continue;
      }
      if (ch === '`' && !inSingle && !inDouble) {
        inBacktick = !inBacktick;
        out += ch;
        continue;
      }
      if (ch === '?' && !inSingle && !inDouble && !inBacktick) {
        i += 1;
        out += '$' + i;
        continue;
      }
      out += ch;
    }
    return { sql: out, params };
  }

  const adaptResult = (res) => [res.rows, res.fields || null];

  module.exports = {
    createPool: (/*config*/) => {
      return {
        query: async (text, params) => {
          const converted = convertPlaceholders(text, params);
          const r = await pool.query(converted.sql, converted.params);
          return adaptResult(r);
        },
        execute: async (text, params) => {
          const converted = convertPlaceholders(text, params);
          const r = await pool.query(converted.sql, converted.params);
          return adaptResult(r);
        },
        getClient: () => pool,
        end: async () => pool.end(),
      };
    },
    createConnection: async (/*config*/) => {
      // return a single client-like wrapper
      const client = await pool.connect();
      return {
        execute: async (text, params) => {
          const converted = convertPlaceholders(text, params);
          const r = await client.query(converted.sql, converted.params);
          return adaptResult(r);
        },
        query: async (text, params) => {
          const converted = convertPlaceholders(text, params);
          const r = await client.query(converted.sql, converted.params);
          return adaptResult(r);
        },
        end: async () => {
          try { client.release(); } catch (e) {}
        }
      };
    }
  };
} else {
  // Fallback to mysql2/promise with the same exported API
  module.exports = require('mysql2/promise');
}
