import { TUserDoc } from "../models/UserData"
import { Debug } from "./Debug"
import Util from "./Util"
import Discord from "discord.js"
import fs from "fs"

export type TItem = {
    name: string,
    key: string,
    discordEmojiID: string,
    itemType: EItemType,
    shopData: { shop?: { type: EItemShopType, tag: string, }, sellable: boolean, price: number }
    craftingData?: { recipe: TItemCraftingIngrediant[], amountCrafted: number }
}

export type TItemCraftingIngrediant = {
    key: string,
    amount: number,
}

export enum EItemType {
    Item = "Item",
    Collectable = "Collectable",
    Tool = "Tool",
}

export enum EItemShopType {
    Regular = "Regular",
    Crate = "Crate",
}

export interface IItemFunc {
    (client: Discord.Client, message: Discord.Message, args: string[], authorAccount: TUserDoc, itemData: TItem): void
}

export type TItemFuncFile = {
    itemFunction: IItemFunc,
    itemData: TItem,
}

export class Handler {

    private static _itemJSONWarehouse: Discord.Collection<string, TItem> = new Discord.Collection()
    private static _itemFunctionCollection: Discord.Collection<string, IItemFunc> = new Discord.Collection()

    /**UNDOCUMENTED */
    static isItemFunctionLoaded(itemKey: string): boolean {
        return this._itemFunctionCollection.has(itemKey);
    }

    /**UNDOCUMENTED */
    static executeItemFunction(itemKey: string, client: Discord.Client, message: Discord.Message, args: string[], authorAccount: TUserDoc, itemData: TItem): boolean {
        let itemFunction = this._itemFunctionCollection.get(itemKey)
        if (!itemFunction) { Debug.logError(`Could not execute item function with key ${itemKey}`, `${require("path").basename(__filename)}`); return false } 
        itemFunction(client, message, args, authorAccount, itemData)
        return true;
    }

    /**UNDOCUMENTED */
    static loadItemFunctionFolder(itemFuncFolderPath: string, logDetails = false) {
        // load js files from folder into an array
        try {
            var jsfiles = fs.readdirSync(itemFuncFolderPath).filter(f => f.split(".").pop() === "js");
        } catch (e) {
            return Debug.logError(e as string, `${require("path").basename(__filename)}`)
        }

        // get the folder name
        let itemFuncFolderName = itemFuncFolderPath.split("/")[itemFuncFolderPath.split("/").length - 1]

        if (logDetails) Util.colorLog("yellow", `Loading ${jsfiles.length} ${itemFuncFolderName} item function(s)...`)

        // for each file load it
        let amountSuccesfullyLoaded = 0;
        jsfiles.forEach((file) => {
            let itemFuncFilePath = `${itemFuncFolderPath}/${file}`;
            if (this.loadItemFunctionFile(itemFuncFilePath)) amountSuccesfullyLoaded++;
        })

        if (logDetails) console.log(`${amountSuccesfullyLoaded} item functions loaded`)
    }

    /**Tries to load an item function from the given `itemFuncFilePath`. If succesful return true, else return false. `logDetails` by default is false. */
    static loadItemFunctionFile(itemFuncFilePath: string, logDetails = false): boolean {

        if (logDetails) Util.colorLog("yellow", `Loading ${itemFuncFilePath} item function...`)
        try { 
            var itemFuncFileData: TItemFuncFile = require(`${process.cwd()}/${itemFuncFilePath}`)
            var itemFuncFileName = itemFuncFilePath.split("/")[itemFuncFilePath.split("/").length - 1]
        } catch (e) {
            Debug.logError(e as string, `${require("path").basename(__filename)}`)
            return false
        }

        // Check if file has any obvious setup errors
        if (!itemFuncFileData.itemFunction)  { Debug.logError(`${itemFuncFileName} has no itemFunction`, `${require("path").basename(__filename)}`); return false }
        if (!itemFuncFileData.itemData)      { Debug.logError(`${itemFuncFileName} has no itemData`, `${require("path").basename(__filename)}`); return false }

        // Load item function into collection, using itemData.key as the key
        this._itemFunctionCollection.set(itemFuncFileData.itemData.key, itemFuncFileData.itemFunction);

        if (logDetails) console.log(`loading complete`)
        return true
    }

    /**UNDOCUMENTED */
    static loadWarehouse(itemConfigPath: string) {
        let fullPath = `${process.cwd()}/${itemConfigPath}`
        let configObject = require(fullPath)

        let keys = Object.keys(configObject);
        let itemsLoaded = 0

        if (keys.length == 1) Util.colorLog("yellow", `loading 1 item...`);
        if (keys.length > 1) Util.colorLog("yellow", `Loading ${keys.length} items...`)

        for (let key in configObject) {
            try {
                let value: TItem = configObject[key]
                if (value.key.toLowerCase() != value.key) Debug.logWarning(`Item key "${value.key}" has capital letters.`, `${require("path").basename(__filename)}`) // warn if an item key has capital letters
                this._itemJSONWarehouse.set(value.key, value)
                itemsLoaded++
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
            }
        }

        console.log(`${itemsLoaded} items loaded`)
        return this._itemJSONWarehouse
    }

    /**UNDOCUMENTED */
    static doesItemExistInWarehouse(itemKey: string): boolean {
        return this._itemJSONWarehouse.has(itemKey);
    }

    /**UNDOCUMENTED */
    static getItemFromWarehouse(itemKey: string): TItem | undefined {
        return this._itemJSONWarehouse.get(itemKey)
    }

    /**UNDOCUMENTED */
    static get ItemsArray(): TItem[] {
        return [...this._itemJSONWarehouse.values()]
    }

    /**UNDOCUMENTED */
    static get CraftableItemsArray(): TItem[] {
        let craftableItems: TItem[] = []

        this.ItemsArray.forEach((item) => {
            if (item.craftingData) craftableItems.push(item)
        })

        return craftableItems
    }

    /**UNDOCUMENTED */
    static get CrateItemsArray(): TItem[] {
        let crateItems: TItem[] = []

        this.ItemsArray.forEach((item) => {
            if (item.shopData.shop && item.shopData.shop.type == EItemShopType.Crate) crateItems.push(item)
        })

        return crateItems
    }

    /**UNDOCUMENTED */
    static get ItemWarehouse(): Map<string, TItem> {
        return this._itemJSONWarehouse
    }
}