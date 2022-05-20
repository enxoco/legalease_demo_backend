const config = require('./config');
const db = require('./services/db')

function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
  }
  
  function emptyOrRows(rows) {
    if (!rows) {
      return [];
    }
    return rows;
  }
  
  /**
   * 
   * Recursive function to go back one page
   * at a time and look for results.  If we
   * land on page 1 and still have no results
   * then just return an empty array.
   */
  async function findPreviousPage(page, results){
    if (results.length > 0) {
      return {
        data: results,
        page: (page + 1)
      }
    }

    if (results.length == 0 && page == 1) {
      return {
        data: [],
        page: 1
      }
    }

    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT id, query, resultsCount, createdAt FROM Searches ORDER BY createdAt DESC LIMIT ${offset},${config.listPerPage + 1}`
    );
    const data = emptyOrRows(rows);
    return findPreviousPage((page - 1), data)
  }
  module.exports = {
    getOffset,
    emptyOrRows,
    findPreviousPage
  }