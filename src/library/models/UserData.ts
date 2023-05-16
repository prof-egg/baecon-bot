import mongoose, { Document, Types } from "mongoose";

export interface IItemSchema {
    name: string,
    amount: number
}

export interface IActivitySchema {
    name: string,
    active: boolean
}

export interface ICooldownSchema {
    name: string,
    time: number,
}

export interface IUserSchema {
    name: string,
    userID: string,
    wallet?: number,
    bank?: number,
    bankLimit?: number
    items?: Map<string, number>,
    activities?: Map<string, boolean>,
    cooldowns?: Map<string, number>,
    commandsUsed?: number,
}

export interface IUserSchemaCertain {
    name: string,
    userID: string,
    wallet: number,
    bank: number,
    bankLimit: number
    items: Map<string, number>,
    activities: Map<string, boolean>,
    cooldowns: Map<string, number>,
    commandsUsed: number
}

export type TUserDoc = (Document<unknown, {}, IUserSchemaCertain> & Omit<IUserSchemaCertain & {_id: Types.ObjectId; }, never>)

const userSchema = new mongoose.Schema<IUserSchema>({
    name: { type: String, required: true },
    userID: { type: String, required: true },
    // lb: { type: String, default: "all" },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    bankLimit: { type: Number, default: 30000 },
    // items: {
    //     type: [{
    //         name: { type: String, required: true },
    //         amount: { type: Number, required: true }
    //     }],
    //     default: []
    // },
    items: { type: Map<string, number>, default: new Map<string, number>() },
    // activities: {
    //     type: [{
    //         name: { type: String, required: true },
    //         active: { type: Boolean, required: true }
    //     }],
    //     default: []
    // },
    activities: { type: Map<string, boolean>, default: new Map<string, boolean>() },
    // cooldowns: {
    //     type: [{
    //         name: { type: String, required: true },
    //         time: { type: Number, required: true }
    //     }],
    //     default: []
    // },
    cooldowns: { type: Map<string, number>, default: new Map<string, number>() },
    // itemCooldowns: {
    //     type: [{
    //         name: { type: String, required: true },
    //         time: { type: Number, required: true }
    //     }],
    //     default: []
    // },
    // itemCooldowns: { type: Map<string, number>, default: new Map<string, number>() },
    commandsUsed: { type: Number, default: 0 },
})

export const UserData = mongoose.model("UserData", userSchema);