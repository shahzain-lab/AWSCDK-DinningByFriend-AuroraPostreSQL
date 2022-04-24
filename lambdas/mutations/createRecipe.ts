
import db from '../db';
import { Recipe } from './mutationTypes';
const { v4: uuid } = require('uuid');

async function createRecipe(recipe: Recipe) {
    if (!recipe.id) recipe.id = uuid();
    const { id, restaurantId, recipename } = recipe;
    try {
        const query = `INSERT INTO recipes (id,restaurantid,recipename) VALUES(:id,:restaurantId,:recipename)`;
        await db.query(query, { id, restaurantId, recipename });
        console.log("recipe ==>", recipe);
         return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recipe),
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

export default createRecipe; 