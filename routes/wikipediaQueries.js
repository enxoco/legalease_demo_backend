/**
 * 
 * TODO
 * 
 * If we have time, need to come back and try and clean this up some.
 * 
 * Currently searching for something like nodejs or vuejs will throw
 * an error because the actual Wikipedia entries are like Node.Js and Vue.Js
 * so we need to figure out a way to handle special characters.
 */
const express = require('express');
const router = express.Router();
const wikipediaQueries = require('../services/wikipediaQueries');
const wiki = require('wikipedia')

/* GET previous Wikipedia queries from the database. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await wikipediaQueries.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting queries `, err.message);
    next(err);
  }
});

router.get('/:term', async function(req, res, next) {
    try {
        const {term} = req.params
        // Get our Wikipedia page
        const page = await wiki.page(term)
        
        // Grab just the plain text content
		const content = await page.content();
        
        /**
         * Create our regEx using our search term
         * and make sure it is case-insensitive
         * Maybe need to create another regex or do a 
         * string replace to strip out dots and other
         * special characters.
         */
        const re = new RegExp(term, 'ig')

        // Get the number of times this term shows up on the page
        const resultsCount = content.match(re).length || 0

        //Try to save our entry in the database
        const savedQuery = await wikipediaQueries.create({query: term, resultsCount})
        
        if (savedQuery.message && savedQuery.message === 'Wikipedia query created successfully') {
            res.json({query: term, results: resultsCount, status: savedQuery.message})
        } else {
            res.json(savedQuery)
        }
	} catch (error) {
		console.log(error);
		//=> Typeof wikiError
	}
})

/* POST wikipedia query */
router.post('/', async function(req, res, next) {
    try {
      res.json(await wikipediaQueries.create(req.body));
    } catch (err) {
      console.error(`Error while creating wikipedia query`, err.message);
      res.json(err.message)
      next(err);
    }
  });

module.exports = router;