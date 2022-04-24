import { EventBridgeEvent, Context } from 'aws-lambda';
import db from './db';


export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

    let data;

    try {


         if (event["detail-type"] === "get_user") {
            const userid = event.detail.userId
            const query  = `SELECT * FROM users WHERE userid = :userid`;

                const results = await db.query(query, { userid });
                data = await results.records[0];
        }

        else if (event["detail-type"] === "get_friend") {
            const id = event.detail.id
            const query  = `SELECT * FROM friends WHERE id = :id`;

                const results = await db.query(query, { id });
                data = await results.records[0];
        }

        else if (event["detail-type"] === "get_recipe") {
           
            const id = event.detail.id
            const query  = `SELECT * FROM recipes WHERE id = :id`;

                const results = await db.query(query, { id });
                data = await  results.records[0];
        }
        else if (event["detail-type"] === "get_restaurant") {
            const ownerid = event.detail.userId
            const query  = `SELECT * FROM restaurant WHERE ownerid = :ownerid`;

                const results = await db.query(query, { ownerid });
                data = await  results.records[0];

        }
        else if (event["detail-type"] === "get_review") {
            const id = event.detail.id
            const query  = `SELECT * FROM reviews WHERE id = :id`;

                const results = await db.query(query, { id });
                data = await  results.records[0];

        }

        else if (event["detail-type"] === "all_users") {
            const query  = `SELECT * FROM users`;
            const results = await db.query(query);
            data = await  results.records;
        }

        else if (event["detail-type"] === "all_freinds") {

            const userid = event.detail.userId
            const query  = `SELECT * FROM friends WHERE userid = :userid`;
            const results = await db.query(query, { userid });
            data = await  results.records;

        }
        else if (event["detail-type"] === "all_recipes") {

            const restaurantId = event.detail.restaurantId
            const query  = `SELECT * FROM recipes WHERE restaurantid = :restaurantId`;
            const results = await db.query(query, { restaurantId });
            data = await  results.records;

        }
        else if (event["detail-type"] === "all_restaurants") {

            const userId = event.detail.userId
            const query  = `SELECT * FROM restaurant WHERE ownerid = :userId`;
            const results = await db.query(query, { userId });
            data = await  results.records;

        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }

    } catch(err){
        console.log(err);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(err),
        }
        
    }
}