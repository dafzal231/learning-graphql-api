import { Arg, Mutation, Query, Resolver, Ctx } from "type-graphql";
import { User } from "../schema/user.schema";
import UserService from "../service/user.service";
import { CreateUserInput } from "../schema/user.schema";
import Context from "../types/context";
import { LoginInput } from "../schema/user.schema";

@Resolver()
export default class UserResolver {

    constructor(private userService: UserService){
        this.userService = new UserService();
    }

    // constructor is used to do a side operation, makes user service
    // a function userService and of type UserService
    // Then calls the function createUser() from the object (class)
    // that has been created already using the constructor
    // tldr uses user.service to create a user based on the input for the mutation

    // why is await not used?
    @Mutation(returns => User)
    createUser(@Arg('input') input: CreateUserInput){ 
        return this.userService.createUser(input)
    }
    // @Arg('name') name: typeOfName is what is passed through to the query - @Arg is the decorator which shows whats an Arg or Ctx for ex
    // Doc: The args argument is an object that contains all GraphQL arguments that were provided for the field by the GraphQL operation.


    @Mutation(() => String) // Returns the JWT
    login(@Arg("input") input: LoginInput, @Ctx() context: Context) {
        return this.userService.login(input, context);
    }

    @Query(type => User)
    me(@Ctx() context: Context){
        return context.user
    }
    // random query that returns type User
    // me() returns the user object which is statically typed out
}