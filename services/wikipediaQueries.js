const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT id, query, resultsCount, createdAt FROM Searches LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

async function create(wikipediaQuery){
    const {query, resultsCount} = wikipediaQuery
    console.log('query', query)
    const result = await db.query(`INSERT INTO Searches (query, resultsCount) VALUES ("${query}", "${resultsCount}");`);
  
    let message = 'Error in creating wikipedia query';
  
    if (result.affectedRows) {
      message = 'Wikipedia query created successfully';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create
}