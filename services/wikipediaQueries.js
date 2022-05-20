const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT id, query, resultsCount, createdAt FROM Searches ORDER BY createdAt DESC LIMIT ${offset},${config.listPerPage + 1}`
  );
  const data = helper.emptyOrRows(rows);

  // Add previous and next positions for pagination
  const meta = {
      prevPage: ((+page - 1) >= 1) ? (+page - 1) : null ,
      page: +page,
      nextPage: (data.length > config.listPerPage) ? +page + 1 : null
  };

  return {
    data,
    meta
  }
}

async function create(wikipediaQuery){
    const {query, resultsCount} = wikipediaQuery
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