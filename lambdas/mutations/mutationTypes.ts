
export type User = {
    userId: string,
    username: string,
    email: string
}

export type Friend = {
    id: string,
    userId: string,
    friendname: string
}

export type Recipe = {
    id: string,
    restaurantId: string,
    recipename: string,
}

export type Restaurant = {
    id: string,
    ownerId: string,
    restaurantname: string,
}

export type Review = {
    id: string,
    recipeId: string,
    review: string,
}