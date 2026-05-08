/**
 * Thin wrapper around sql.js that exposes the same API
 * that the native sqlite3 module provides, allowing
 * Sequelize to use it via dialectModule.
 */
const initSqlJs = require('sql.js');

let SQL = null;

const init = () => initSqlJs().then(s => { SQL = s; });

class Database {
  constructor(path, mode, callback) {
    if (!SQL) { callback(new Error('sql.js not initialized')); return; }
    this._db = new SQL.Database();
    this._open = true;
    if (callback) setImmediate(() => callback(null));
  }

  run(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    try {
      this._db.run(sql, params || []);
      if (callback) callback.call({ lastID: 0, changes: 0 }, null);
    } catch (e) {
      if (callback) callback(e);
    }
    return this;
  }

  get(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    try {
      const stmt = this._db.prepare(sql);
      stmt.bind(params || []);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      if (callback) callback(null, row);
    } catch (e) {
      if (callback) callback(e);
    }
    return this;
  }

  all(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    try {
      const stmt = this._db.prepare(sql);
      stmt.bind(params || []);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      if (callback) callback(null, rows);
    } catch (e) {
      if (callback) callback(e);
    }
    return this;
  }

  close(callback) {
    try { this._db.close(); this._open = false; if (callback) setImmediate(() => callback(null)); }
    catch (e) { if (callback) callback(e); }
  }

  serialize(fn) { if (fn) fn(); }
  parallelize(fn) { if (fn) fn(); }

  prepare(sql) {
    const db = this._db;
    const stmt = db.prepare(sql);
    return {
      run(params, cb) {
        try { stmt.run(params || []); if (cb) cb.call({ lastID: 0, changes: 0 }, null); }
        catch (e) { if (cb) cb(e); }
        return this;
      },
      get(params, cb) {
        try {
          stmt.bind(params || []);
          const row = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.reset();
          if (cb) cb(null, row);
        } catch (e) { if (cb) cb(e); }
        return this;
      },
      all(params, cb) {
        try {
          stmt.bind(params || []);
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.reset();
          if (cb) cb(null, rows);
        } catch (e) { if (cb) cb(e); }
        return this;
      },
      finalize(cb) { try { stmt.free(); if (cb) cb(null); } catch (e) { if (cb) cb(e); } }
    };
  }
}

Database.OPEN_READWRITE = 2;
Database.OPEN_CREATE = 4;
Database.OPEN_FULLMUTEX = 65536;

module.exports = { Database, init };
