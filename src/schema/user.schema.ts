import { getModelForClass, prop, pre} from "@typegoose/typegoose";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import {Field, InputType, ObjectType} from "type-graphql";
import bcrypt from 'bcrypt';

@pre<User>('save', async function(){
    if(!this.isModified('password')){
        return;
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hashSync(this.password, salt)

    this.password = hash
})
// before save, function is called, needs to be async
// uses a hash

@ObjectType()
export class User {
    @Field(returns => String)
    _id: string

    @Field(returns => String)
    @prop({required: true})
    name: string

    @Field(returns => String)
    @prop({required: true})
    email: string

    @prop({required: true})
    password: string

}

export const UserModel = getModelForClass(User)

// ObjectType() is used to decorate the class with the @ObjectType decorator. It marks the class as the type known from the GraphQL SDL or GraphQLObjectType
// Note: For simple types (like string or boolean) this is all that's needed but due to a limitation in TypeScript's reflection, we need to provide info about generic types (like Array or Promise). So to declare the Rate[] type, we have to use the explicit [ ] syntax for array types - @Field(type => [Rate])

// ObjectType() creates a schema which is in this case just telling mongoose what the table should look like when creating the overall table
// a model on the other hand is used to insert, delete, change the actual data 

@InputType()
export class CreateUserInput{
    @Field(type => String)
    name: string

    @IsEmail()
    @Field(type => String)
    email: string

    @MinLength(6, {
        message: "password must be atleast 6 characters"
    })
    @MaxLength(50, {
        message: "password must not be longer than 50 characters"
    })
    @Field(type => String)
    password: string
}

// needed for mutations, same as an objectType()
// its better as it allows for checks to be made for the input thats given
// for a user object type

@InputType()
export class LoginInput{
    @Field(type => String)
    email: string

    @Field(type => String)
    password: string
}

