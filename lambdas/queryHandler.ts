import { EventBridgeEvent, Context } from 'aws-lambda';
import db from './db';


export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

    try {

        if (event["detail-type"] === "recommendations") {

               
        }

        else if (event["detail-type"] === "get_user") {
            const userid = event.detail.userId
            const query  = `SELECT * FROM users WHERE userid = :userid`;

                const results = await db.query(query, { userid });
                return results.records[0];
        }

        else if (event["detail-type"] === "get_friend") {
        }

        else if (event["detail-type"] === "get_recipe") {
           

        }
        else if (event["detail-type"] === "get_restaurant") {
           

        }
        else if (event["detail-type"] === "get_friendOfFriend") {
           

        }
        else if (event["detail-type"] === "get_review") {
           

        }

        else if (event["detail-type"] === "all_users") {
            const query  = `SELECT * FROM users`;
            const results = await db.query(query);
            return results.records;
        }

        else if (event["detail-type"] === "all_freinds") {

            const userid = event.detail.userId
            const query  = `SELECT * FROM friends WHERE userid = :userid`;
            const results = await db.query(query, { userid });
            return results.records;

        }
        else if (event["detail-type"] === "all_recipes") {

            const restaurantId = event.detail.restaurantId
            const query  = `SELECT * FROM recipes WHERE restaurantid = :restaurantId`;
            const results = await db.query(query, { restaurantId });
            return results.records;

        }
        else if (event["detail-type"] === "all_restaurants") {

            const userId = event.detail.userId
            const query  = `SELECT * FROM restaurant WHERE ownerid = :userId`;
            const results = await db.query(query, { userId });
            return results.records;

        }
        // else if (event["detail-type"] === "all_friendOfFreind") {
            
        //     const friendId = event.detail.friendId
        //     const query  = `SELECT * FROM restaurant WHERE owner_id = :userId`;
        //     const results = await db.query(query, { userId });
        //     return results.records;

        // }


    } catch(err){
        console.log(err);
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(err),
        }
        
    }
}