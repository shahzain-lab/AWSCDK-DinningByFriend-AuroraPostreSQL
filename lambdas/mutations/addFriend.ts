
import db from '../db';
import { Friend } from './mutationTypes';
const { v4: uuid } = require('uuid');

async function addFriend(friend: Friend) {
    if (!friend.id) friend.id = uuid();
    const { id, userId, friendname } = friend;
    try {
        const query = `INSERT INTO friends (id,userid,friendname) VALUES(:id,:userId,:friendname)`;
         await db.query(query, { id, userId, friendname });
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(friend),
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

export default addFriend;