import { getModelForClass, prop, pre, queryMethod, index} from "@typegoose/typegoose";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import {Field, InputType, ObjectType} from "type-graphql";
import bcrypt from 'bcrypt';
import { AsQueryMethod, ReturnModelType } from "@typegoose/typegoose/lib/types";


function findByEmail(
    this: ReturnModelType<typeof User, QueryHelpers>,
    email: User["email"]
  ) {
    return this.findOne({ email });
  }
  
interface QueryHelpers {
    findByEmail: AsQueryMethod<typeof findByEmail>;
}
// this is of ReturnModelType of User and QueryHelpers
// QueryHelpers is just a type of QueryMethod it takes a generic
// and that's why we can pass in a function to it, so we can
// call the function later on

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


@index({ email: 1 })
@queryMethod(findByEmail)
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

// ObjectType() is used to decorate the class with the @ObjectType decorator. It marks the class as the type known from the GraphQL SDL or GraphQLObjectType
// Note: For simple types (like string or boolean) this is all that's needed but due to a limitation in TypeScript's reflection, we need to provide info about generic types (like Array or Promise). So to declare the Rate[] type, we have to use the explicit [ ] syntax for array types - @Field(type => [Rate])

// ObjectType() creates a schema which is in this case just telling mongoose what the table should look like when creating the overall table
// a model on the other hand is used to insert, delete, change the actual data 

// needed for mutations, same as an objectType()
// its better as it allows for checks to be made for the input thats given
// for a user object type

export const UserModel = getModelForClass<typeof User, QueryHelpers>(User);

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: "password must be at least 6 characters long",
  })
  @MaxLength(50, {
    message: "password must not be longer than 50 characters",
  })
  @Field(() => String)
  password: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}