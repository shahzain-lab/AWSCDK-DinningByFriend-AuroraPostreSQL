import { EventBridgeEvent, Context } from 'aws-lambda';
import addFriend from './mutations/addFriend';
import addRestaurant from './mutations/addRestaurant';
import addUser from './mutations/addUser';
import createRecipe from './mutations/createRecipe';
import createReview from './mutations/createReview';



export const handler = async (event: EventBridgeEvent<string, any>, context: Context):Promise<any> => {
    console.log(JSON.stringify(event, null, 2));

        if (event["detail-type"] === "add_user") {

                const user = await addUser(event.detail);
                console.log("returned user", user);
                return user
        }else if (event["detail-type"] === "add_friend"){

                const friend = await addFriend(event.detail);
                console.log("returned user", friend);
                return friend
        }else if(event["detail-type"] === "add_restaurant") {

                const restaurant = await addRestaurant(event.detail);
                console.log("returned user", restaurant);
                return restaurant

        }else if(event["detail-type"] === "create_recipe") {

                const recipe = await createRecipe(event.detail);
                console.log("returned user", recipe);
                return recipe

        }else if(event["detail-type"] === "create_review") {

                const review = await createReview(event.detail);
                console.log("returned user", review);
                return review
        }
}