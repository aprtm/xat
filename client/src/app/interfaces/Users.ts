import { Conversation } from './Conversations';

// Interface for a user profile
export interface User {
    _id:string
    username:string
    email:string
    pictureUrl?:string
    friends:User[]
    conversations:Conversation[]
}

//Interface for a friend/contact
export interface Contact {
    id:string
    name:string
    conversation_id?:string
    pictureUrl?:string
}
