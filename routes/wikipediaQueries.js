const express = require('express');
const router = express.Router();
const wikipediaQueries = require('../services/wikipediaQueries');

/* GET previous Wikipedia queries from the database. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await wikipediaQueries.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting queries `, err.message);
    next(err);
  }
});

/* POST wikipedia query */
router.post('/', async function(req, res, next) {
    try {
        console.log('req', req.body)
      res.json(await wikipediaQueries.create(req.body));
    } catch (err) {
      console.error(`Error while creating wikipedia query`, err.message);
      next(err);
    }
  });

module.exports = router;