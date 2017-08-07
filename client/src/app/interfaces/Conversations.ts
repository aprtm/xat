import { User, Contact } from './Users'

export interface Participant extends Contact{
    join_date:Date|number
}

export interface Message{
    _id:string
    author_id:string
    author_name:string
    conversation_id:string
    date:number
    content:string
    receivers?:Contact[]
}

export interface Conversation {
    _id:string
    creator_id:string
    date:number
    participants:Participant[]
    name:string
    messages:Message[]
}

export interface Room{
    id:string
    name:string,
    pictureUrl:string
}
