import { Conversation } from './Conversations';

export interface User {
    _id:string
    username:string
    password:string
    email:string
    friends:User[]
    conversations:Conversation[]
}

export interface Contact {
    user_id:string
    username:string
}
