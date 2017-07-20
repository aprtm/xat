export interface User {
    _id:string
    username:string
    password:string
    email:string
    friends:User[]
    conversations:number[]
}
