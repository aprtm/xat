import { User, Contact } from './Users'

export interface Participant extends Contact{
    join_date:Date|number
}

export interface Message{
    _id:string
    owner_id:string
    owner_name:string
    conversation_id:string
    date:number
    content:string
}

export interface Conversation {
    _id:string
    owner_id:string
    date:number
    participants:Participant[]
    name:string
    messages:string[]
}
