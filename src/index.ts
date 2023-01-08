import dotenv from "dotenv";
dotenv.config()
import 'reflect-metadata'
import express from 'express'
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express"
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageProductionDefault, } from "apollo-server-core";
import { resolvers } from "./resolvers";
import { connectToMongo } from "./utils/mongo";
import { verifyJwt } from "./utils/jwt";
import { User } from "./schema/user.schema";
import Context from "./types/context";

async function bootstrap() {

    // build schema

    const schema = await buildSchema({
        resolvers: [resolvers],
        // authChecker,
    })

    // init express
    const app = express();

    app.use(cookieParser())
    // gives res an extra object cookie
    // gives req an object cookies, cookie that have been sent
    // Example:
    // App.get("/send", (req, res) => {
    //     res.cookie("loggedin", "true");
    //     res.send("Cookie sent!");
    // });

    // App.get("/read", (req, res) => {

    //     let response = "Not logged in!";

    //     if(req.cookies.loggedin == "true") {
    //         response = "Yup! You are logged in!";
    // }

    // create apollo server


    const server = new ApolloServer({
        schema,
        context: (ctx: Context) =>{

            const context = ctx;

            if(ctx.req.cookies.accessToken){
                const user = verifyJwt<User>(ctx.req.cookies.accessToken)
                context.user = user
            }
            return ctx
        },
        plugins: [
            process.env.NODE_ENV === "production" ? ApolloServerPluginLandingPageProductionDefault() : ApolloServerPluginLandingPageGraphQLPlayground(),
        ]
    });

    await server.start();

    // apply middleware

    server.applyMiddleware({ app })
    // When you pass your app to applyMiddleware, Apollo Server automatically configures various middleware (including body parsing, the 
    // GraphQL Playground frontend, and CORS support), so you don't need to apply them with a mechanism like app.use.

    app.listen({port: 4000}, () => {
        console.log("app is listening on port 4000")
    })

    connectToMongo()
}

bootstrap()