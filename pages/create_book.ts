import { Request, Response } from 'express';
import Book from '../models/book';
import express from 'express';
import bodyParser from 'body-parser';
import { validateBookDetailsMiddleware, RequestWithSanitizedBookDetails } from '../sanitizers/bookSanitizer';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * Middleware specific to this router
 * The function is called for every request to this router
 * It parses the body and makes it available under req.body
 */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route POST /newbook
 * @returns a newly created book for an existing author and genre in the database
 * @returns 500 error if book creation failed
 * @returns 400 error if the input validation fails
 */

/**
 * Added rate limiting to prevent excessive requests from a single IP.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

router.post('/newbook', limiter, validateBookDetailsMiddleware, async (req: RequestWithSanitizedBookDetails, res: Response) => {
  try {
    const { familyName, firstName, genreName, bookTitle } = req.body;
    const book = new Book({});
    const savedBook = await book.saveBookOfExistingAuthorAndGenre(familyName, firstName, genreName, bookTitle);
    res.status(200).send(savedBook);
  } catch (err: unknown) {
    console.error('Error creating book:', (err as Error).message);
    const escapedErrorMessage = (err as Error).message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    res.status(500).send(`Error creating book: ${escapedErrorMessage}`);
  }
});

export default router;