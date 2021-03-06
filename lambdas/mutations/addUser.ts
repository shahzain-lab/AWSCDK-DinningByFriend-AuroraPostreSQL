import db from '../db';
import { User } from './mutationTypes';
const { v4: uuid } = require('uuid');

async function addUser(user: User) {
    if (!user.userId) user.userId = uuid();
    const { userId, username, email } = user;
    try {
        const query = `INSERT INTO users (userid,username,email) VALUES(:userId,:username,:email)`;
         await db.query(query, { userId, username, email });
         console.log("USER ==>", user);
         const data = {
            user_Id: user.userId,
            user_Name: user.username,
            user_email: user.email,
            restaurants: [],
            friends: []
         }
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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

export default addUser;