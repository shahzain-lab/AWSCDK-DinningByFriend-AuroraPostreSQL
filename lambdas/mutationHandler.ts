import { EventBridgeEvent, Context } from 'aws-lambda';
import addFriend from './mutations/addFriend';
import addRestaurant from './mutations/addRestaurant';
import addUser from './mutations/addUser';
import createRecipe from './mutations/createRecipe';
import createReview from './mutations/createReview';



export const handler = async (event: EventBridgeEvent<string, any>, context: Context):Promise<any> => {
    console.log(JSON.stringify(event, null, 2));

        if (event["detail-type"] === "add_user") {

                return await addUser(event.detail);

        }else if (event["detail-type"] === "add_friend"){

                return await addFriend(event.detail);

        }else if(event["detail-type"] === "add_restaurant") {

                return await addRestaurant(event.detail);

        }else if(event["detail-type"] === "create_recipe") {

                return await createRecipe(event.detail);

        }else if(event["detail-type"] === "create_review") {

                return await createReview(event.detail);
        }
}