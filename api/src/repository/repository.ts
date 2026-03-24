import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let adapter

try{
        adapter = new PrismaPg({
        connectionString : process.env.DATABASE_URL,
        })
        console.log("Successfully initialized DB")
}catch{
        throw new Error("Could not open DB")
}



export const db = new PrismaClient({ adapter })