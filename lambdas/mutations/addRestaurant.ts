
import db from '../db';
import { Restaurant } from './mutationTypes';
const { v4: uuid } = require('uuid');

async function addRestaurant(restaurant: Restaurant) {
    if (!restaurant.id) restaurant.id = uuid();
    const { id, ownerId, restaurantname } = restaurant;
    try {
        const query = `INSERT INTO restaurant (id,ownerid,restaurantname) VALUES(:id,:ownerId,:restaurantname)`;
         await db.query(query, { id, ownerId, restaurantname });
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(restaurant),
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

export default addRestaurant;