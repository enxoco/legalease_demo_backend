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

/* DELETE query from database */
router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await wikipediaQueries.handleDelete(req.params.id));
    } catch (err) {
      console.error(`Error while deleting wikipedia query`, err.message);
      res.json(err.message)
      next(err);
    }
  });   

/**
 * GET
 * Perform search via Wikipedia API for a given term
 * If it exists, then count the number of times the
 * search term appears on the page and save it to
 * the database.  If the page does not exist, then
 * save it with 0 results.
 * 
 */
router.get('/:term', async function(req, res, next) {
    try {
        const {term} = req.params
        // Get our Wikipedia page
        const page = await wiki.page(term)
        
        // Grab just the plain text content
        const content = await page.content();
      
        /**
         * Create our regEx to search for the term on the page.
         * 
         * Create a custom filter to deal with entries for JavaScript libraries.
         * For instance, searching for Vuejs will turn up a Wikipedia page with
         * Vue.js.  Remove the dot and only search for the name of the library
         * or framework
         * 
         */
        const re = (term.slice(-2) == 'js') ? new RegExp(term.slice(0,-2), 'ig') : new RegExp(term, 'ig') 

        // Get the number of times this term shows up on the page
        /**
         * Find the number of times that the given term appears
         * in the body content of the page.
         * 
         * - Does not count the title of the page
         * - Does not count sidebar content
         * - Does not count references and related articles
         * - Does not include certain links and other sections
         * 
         */
        const resultsCount = content.match(re).length || 0

        //Try to save our entry in the database
        const savedQuery = await wikipediaQueries.create({query: term, resultsCount})
        
        if (savedQuery.message && savedQuery.message === 'Wikipedia query created successfully') {
            res.json({query: term, results: resultsCount, status: savedQuery.message})
        } else {
            res.json(savedQuery)
        }
        res.end()
	} catch (error) {
    /**
     * If we get an error, it most likely meeans that the requested page
     * doesn't currently exist.  In this case we can just return 0 results
     */
    const savedQuery = await wikipediaQueries.create({query: req.params.term, resultsCount: 0})

    res.json({query: req.params.term, results: 0, status: savedQuery.message})
    res.end()
	}
})

/**
 * POST wikipedia query
 * 
 * Create
 */
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