import { IUserSchema, TUserDoc, UserData } from "../models/UserData"
import { Debug } from "./Debug"
import { Time, TimeParsedObject } from "./Time"
import * as Item from "./ItemHandler"

export class Manager {

    static createAccount(schemaObject: IUserSchema): Promise<TUserDoc | undefined> {
        return new Promise(async (resolve) => {

            const newAccountData = new UserData(schemaObject)

            try {
                await newAccountData.save()
                resolve(newAccountData as TUserDoc)
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
                resolve(undefined);
            }
        })
    }

    static getUserAccount(discordUserID: string): Promise<TUserDoc | undefined> {
        return new Promise(async (resolve) => {
            try {
                // Try and find user account, if no account, return Promise<undefined>, else return Promise<TUserDoc>
                let account = await UserData.findOne({ userID: discordUserID })
                if (!account) resolve(undefined)

                resolve(account as TUserDoc);
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
                resolve(undefined)
            }
        })
    }

    /**DOCUMENTATION NEEDED */
    static addItem(account: TUserDoc, itemKey: string, amount = 1, saveAccount = false): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let currentAmount = account.items.get(itemKey)

            if (!Item.Handler.doesItemExistInWarehouse(itemKey)) { 
                let errMsg = `Tried to add item "${itemKey}" which does not exist in itemJSONWarehouse to user account.`
                Debug.logError(errMsg, `${require("path").basename(__filename)}`)
                reject(`Tried to add item "${itemKey}" which does not exist in itemJSONWarehouse to user account.`) 
            }

            try {
                if (currentAmount) account.items.set(itemKey, amount + currentAmount)
                else account.items.set(itemKey, amount)

                if (saveAccount) await account.save()
                resolve()
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
                resolve()
            }
        })
    }

    /**This method was only created beacause of the typesafety on the `activity` parameter.
     * @example <caption>This is all the function does</caption>
     * return account.activities.get(activity)
     */
    static getActivityState(account: TUserDoc, activity: TActivity): boolean | undefined {
        return account.activities.get(activity)
    }

    /**Sets an activity to a desired boolean, if there is no activity create one. `saveAccount` is false by default, only pass true if `TUserDoc.save()` is not being called somewhere else.*/
    static setUserActivity(account: TUserDoc, activity: TActivity, activityBoolean: boolean, saveAccount = false): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                account.activities.set(activity, activityBoolean)
                if (saveAccount) await account.save()
                resolve()
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
                resolve()
            }
        })
    }

    /**Updates cooldown on account, if there is no cooldown create one. `saveAccount` is false by default, only pass true if `TUserDoc.save()` is not being called somewhere else.*/
    static updateCooldown(account: TUserDoc, cooldownData: TCooldown, saveAccount = false): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                account.cooldowns.set(cooldownData.key, Date.now())
                if (saveAccount) await account.save()
                resolve()
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
                resolve()
            }
        })
    }

    static isOnCooldown(account: TUserDoc, cooldownData: TCooldown): boolean {

        // Get cooldown timestamp, if they dont have one return false as they have clearly never gotten a cooldown before
        let cooldownTimestamp = account.cooldowns.get(cooldownData.key)
        if (!cooldownTimestamp) return false;

        // If the time between now and then is smaller than the cooldown value, then the user is still on cooldown
        let timeElapsed = Date.now() - cooldownTimestamp
        if (timeElapsed < cooldownData.time) return true;

        // Return false if not
        return false;
    }

    static getTimeLeftOnCooldownParsed(account: TUserDoc, cooldownData: TCooldown): TimeParsedObject {
        // Get cooldown timestamp, if they dont have one return 0 as they have clearly never gotten a cooldown before
        let cooldownTimestamp = account.cooldowns.get(cooldownData.key)
        if (!cooldownTimestamp) return Time.parse(0);

        // Calcualte time left and return it as parsed object
        let timeElapsed = Date.now() - cooldownTimestamp
        let timeLeftOnCooldown = cooldownData.time - timeElapsed;
        return Time.parse(timeLeftOnCooldown)
    }

}

type TCooldown = {
    key: string,
    time: number,
    isItemCooldown: boolean
}

type TActivity = "isPlayingGame"