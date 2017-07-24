import { User, Contact } from './Users'

export interface Participant extends Contact{
    join_date:Date;
}

export interface Message{
    owner_id:string
    username:string
    date:Date
    content:string
}

export interface Conversation {
    _id:string
    owner_id:string
    date:number
    participants:Participant[]
    name:string
    messages:Message[]
}
