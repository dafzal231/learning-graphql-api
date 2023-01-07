import { UserModel } from "../schema/user.schema"

export class UserService {
    async createUser(input: any){
        // call user model to create a user
        return UserModel.create(input)
    }
}