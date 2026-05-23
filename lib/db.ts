import { Pool, QueryResult } from 'pg';

interface PoolLike {
  query: (text: string, params?: any[]) => Promise<[any, any]>;
  execute: (text: string, params?: any[]) => Promise<[any, any]>;
  getConnection: () => Promise<ConnectionLike>;
  end: () => Promise<void>;
}

interface ConnectionLike {
  query: (text: string, params?: any[]) => Promise<[any, any]>;
  execute: (text: string, params?: any[]) => Promise<[any, any]>;
  beginTransaction?: () => Promise<void>;
  commit?: () => Promise<void>;
  rollback?: () => Promise<void>;
  release: () => void;
}

type CreatePoolConfig = {
  connectionString?: string;
  host?: string;
  user?: string;
  password?: string;
  database?: string;
  port?: string | number;
  [key: string]: any;
};

const envConnectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_URL_PG || '';

function convertPlaceholders(sql: string, params?: any[]): { sql: string; params?: any[] } {
  if (!params || params.length === 0) {
    return { sql, params };
  }

  let index = 0;
  let result = '';
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let escaped = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];

    if (char === '\\' && !escaped) {
      escaped = true;
      result += char;
      continue;
    }

    if (!escaped) {
      if (char === "'") {
        inSingle = !inSingle;
      } else if (char === '"') {
        inDouble = !inDouble;
      } else if (char === '`') {
        inBacktick = !inBacktick;
      }
    }

    if (char === '?' && !inSingle && !inDouble && !inBacktick && !escaped) {
      index += 1;
      result += `$${index}`;
    } else {
      result += char;
    }

    if (escaped && char !== '\\') {
      escaped = false;
    }
  }

  return { sql: result, params };
}

function createPoolConfig(config?: CreatePoolConfig) {
  if (config?.connectionString) {
    return { connectionString: config.connectionString };
  }

  if (envConnectionString) {
    return { connectionString: envConnectionString };
  }

  const poolConfig: any = {};
  if (config) {
    if (config.host) poolConfig.host = config.host;
    if (config.user) poolConfig.user = config.user;
    if (config.password) poolConfig.password = config.password;
    if (config.database) poolConfig.database = config.database;
    if (config.port) poolConfig.port = config.port;
  }
  return poolConfig;
}

function adaptResult(res: QueryResult): [any, any] {
  return [res.rows, res.fields || null];
}

function createPool(config?: CreatePoolConfig): PoolLike {
  const pool = new Pool(createPoolConfig(config));

  return {
    query: async (text: string, params?: any[]) => {
      const { sql, params: convertedParams } = convertPlaceholders(text, params);
      return adaptResult(await pool.query(sql, convertedParams));
    },
    execute: async (text: string, params?: any[]) => {
      const { sql, params: convertedParams } = convertPlaceholders(text, params);
      return adaptResult(await pool.query(sql, convertedParams));
    },
    getConnection: async () => {
      const client = await pool.connect();
      return {
        query: async (text: string, params?: any[]) => {
          const { sql, params: convertedParams } = convertPlaceholders(text, params);
          return adaptResult(await client.query(sql, convertedParams));
        },
        execute: async (text: string, params?: any[]) => {
          const { sql, params: convertedParams } = convertPlaceholders(text, params);
          return adaptResult(await client.query(sql, convertedParams));
        },
        beginTransaction: async () => {
          await client.query('BEGIN');
        },
        commit: async () => {
          await client.query('COMMIT');
        },
        rollback: async () => {
          await client.query('ROLLBACK');
        },
        release: () => {
          client.release();
        },
      };
    },
    end: async () => {
      await pool.end();
    },
  };
}

async function createConnection(config?: CreatePoolConfig) {
  const pool = new Pool(createPoolConfig(config));
  const client = await pool.connect();
  return {
    query: async (text: string, params?: any[]) => {
      const { sql, params: convertedParams } = convertPlaceholders(text, params);
      return adaptResult(await client.query(sql, convertedParams));
    },
    execute: async (text: string, params?: any[]) => {
      const { sql, params: convertedParams } = convertPlaceholders(text, params);
      return adaptResult(await client.query(sql, convertedParams));
    },
    beginTransaction: async () => {
      await client.query('BEGIN');
    },
    commit: async () => {
      await client.query('COMMIT');
    },
    rollback: async () => {
      await client.query('ROLLBACK');
    },
    release: () => {
      client.release();
    },
  };
}

export default {
  createPool,
  createConnection,
};
