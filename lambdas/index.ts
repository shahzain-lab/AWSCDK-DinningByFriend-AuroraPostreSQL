import { EventBridgeEvent,Context } from "aws-lambda";

export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));
    const GQL_MUTATIONS = [
        "add_user",
        "add_friend",
        "add_restaurant",
        "create_recipe",
        "create_review",
    ]
    const GQL_QUERIES = [
        "recommendations",
        "get_user",
        "get_friend",
        "get_recipe",
        "get_restaurant",
        "get_friendOfFriend",
        "get_review",
        "all_freinds",
        "all_recipes",
        "all_reviews",
        "all_restaurants",
        "all_friendOfFreind",
    ]

try{
    const mutation = GQL_MUTATIONS.find(field => field === event["detail-type"])
    const query = GQL_QUERIES.find(field => field === event["detail-type"])

    if(event["detail-type"] === mutation){
        return {
            event,
            operation: "mutation"
        }
    }else if(event["detail-type"] === query){
        return {
            event,
            operation: "query"
        }
    }
    return null;

}catch(err){
    return "fields not found"
}

};