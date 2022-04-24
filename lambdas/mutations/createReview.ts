// lambdas/createPost.ts
import db from '../db';
import { Review } from './mutationTypes';
const { v4: uuid } = require('uuid');

async function createReview(recipeReview: Review) {
    if (!recipeReview.id) recipeReview.id = uuid();
    const { id, recipeId, review } = recipeReview;
    try {
        const query = `INSERT INTO reviews (id,recipeid,review) VALUES(:id,:recipeId,:review)`;
        await db.query(query, { id, recipeId, review });
        console.log("recipeReview ==>", recipeReview);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recipeReview),
        };
    } catch (err) {
        console.log('Postgres error: ', err);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(err),
        };
    }
}

export default createReview;