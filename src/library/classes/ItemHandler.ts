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

// ITEM JSON
export const cob: TItem = {
    name: "Container of Bacon",
    key: "cob",
    discordEmojiID: "738470510702362745",
    itemType: EItemType.Item,
    shopData: { sellable: false, price: 125 },
}

export const cCrate: TItem = {
    name: "Cardboard Crate",
    key: "cCrate",
    discordEmojiID: "822570562382725173",
    itemType: EItemType.Item,
    shopData: {
        shop: {
            type: EItemShopType.Crate, 
            tag: "Worst crate and has a high chance to not give an item",
        },
        sellable: true, 
        price: 500
    },
}

export class Handler {

    private static itemJSONWarehouse: Map<string, TItem> = new Map([
        [cob.key, cob],
        [cCrate.key, cCrate]
    ])

    static doesItemExistInWarehouse(itemKey: string): boolean {
        return this.itemJSONWarehouse.has(itemKey);
    }

    static getItemFromWarehouse(iteKey: string): TItem | undefined {
        return this.itemJSONWarehouse.get(iteKey)
    }

    static get ItemsArray(): TItem[] {
        return [...this.itemJSONWarehouse.values()]
    }

    static get CraftableItemsArray(): TItem[] {
        let craftableItems: TItem[] = []

        this.ItemsArray.forEach((item) => {
            if (item.craftingData) craftableItems.push(item)
        })

        return craftableItems
    }

    static get CrateItemsArray(): TItem[] {
        let crateItems: TItem[] = []

        this.ItemsArray.forEach((item) => {
            if (item.shopData.shop && item.shopData.shop.type == EItemShopType.Crate) crateItems.push(item)
        })

        return crateItems
    }

    static get ItemJSONWarehouse(): Map<string, TItem> {
        return this.itemJSONWarehouse
    }
}