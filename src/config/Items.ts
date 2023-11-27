import { EItemShopType, EItemType, TItem } from "../library/classes/ItemHandler"

// ITEM JSON
export const cob: TItem = {
    name: "Container of Bacon",
    key: "cob",
    discordEmojiID: "738470510702362745",
    itemType: EItemType.Item,
    shopConfig: { sellable: false, price: 125 },
}

export const cCrate: TItem = {
    name: "Cardboard Crate",
    key: "ccrate",
    discordEmojiID: "822570562382725173",
    itemType: EItemType.Item,
    shopConfig: {
        shop: {
            type: EItemShopType.Crate, 
            tag: "Worst crate and has a high chance to not give an item",
        },
        sellable: true, 
        price: 500
    },
}

export const grill: TItem = {
    name: "Grill",
    key: "grill",
    discordEmojiID: "822570181946507365",
    itemType: EItemType.Item,
    shopConfig: {
        shop: {
            type: EItemShopType.Regular,
            tag: "You can use your grill to cook some delicious bacon!"
        },
        sellable: true,
        price: 5000
    },
    cooldown: 60000
}