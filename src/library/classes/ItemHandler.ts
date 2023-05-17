import { Debug } from "./Debug"
import Util from "./Util"

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

export class Handler {

    private static _itemJSONWarehouse: Map<string, TItem> = new Map()

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
                this._itemJSONWarehouse.set(value.key, value)
                itemsLoaded++
            } catch (e) {
                Debug.logError(<string>e, `${require("path").basename(__filename)}`)
            }
        }

        console.log(`${itemsLoaded} items loaded`)
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