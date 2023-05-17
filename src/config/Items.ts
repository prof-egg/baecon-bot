import { EItemShopType, EItemType, TItem } from "../library/classes/ItemHandler"

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