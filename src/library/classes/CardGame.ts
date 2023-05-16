export class CardGame {

    private _house: IPlayer = { name: "House", cards: [] }
    private _players = new Map<string, IPlayer>()

    private _deck = this._getNewDeck()

    /**NEEDS DOCUMENTATION */
    constructor(playerKeys: string[]) {
        playerKeys.forEach((key) => {
            let playerObject: IPlayer = { name: key, cards: [] }
            this._players.set(playerObject.name, playerObject)
        });
    }
    
    // editHand(indexArray: number[],  playerKey?: string): void {

    //     let cardArrayToEdit = this._house.cards
    //     if (playerKey) {
    //         let player = this._players.get(playerKey)
    //         if (!player) return
    //         cardArrayToEdit = player.cards
    //     }

    //     cardArrayToEdit.forEach((card) => {

    //     })
    // }

    /**DOCUMENTATION NEEDED. If an invalid `playerKey` is passed, method returns an empty string.*/
    getHandAsString(options: { cardCount?: number, spaceFiller?: string, playerKey?: string }): string {

        // Set defaults for the options and assign stuff if passed\
        let hand = this._house.cards
        if (options.playerKey) {
            let player = this._players.get(options.playerKey)
            if (!player) return ""
            hand = player.cards
        }

        let cardCount = hand.length
        if (options.cardCount) cardCount = options.cardCount

        let spaceFiller = ""
        if (options.spaceFiller) spaceFiller = options.spaceFiller

        // Make the string
        let handAsString = ""
        let i = 0;
        for (i = 0; i < cardCount - 1; i++) // Run until just before the end because there doesn't need to be filler on the last loop
            handAsString += `${hand[i].face}${hand[i].suit}${spaceFiller}`
        handAsString += `${hand[i].face}${hand[i].suit}`
        
        return handAsString
    }

    /**Function idea to stop repeating code, but this returns a new array, instead of pointing to the existing one */
    private _getHandFromPlayerKey(playerKey?: string): Card[] {
        if (playerKey) {
            let player = this._players.get(playerKey)
            if (!player) return []
            return player.cards
        }
        return this._house.cards
    }

    /**DOCUMENTATION NEEDED */
    editCardInHand(cardIndex: number, newCardChanges: { face?: TCardFace, value?: number, suit?: TCardSuit }, playerKey?: string): void {

        let hand = this._house.cards
        if (playerKey) {
            let player = this._players.get(playerKey)
            if (!player) return 
            hand = player.cards
        }

        let { face, value, suit } = newCardChanges

        if (face) hand[cardIndex].face = face
        if (value) hand[cardIndex].value = value
        if (suit) hand[cardIndex].suit = suit
    }

    /**Returns an array of indexes from wich the filter matched to the hand. If `playerKey` is left undefined, the filtered indexes for the house hand will be returned. If an invalid `playerKey` is passed, method returns an empty array.*/
    cardFilter(filterOptions: { face?: TCardFace, value?: number, suit?: TCardSuit }, playerKey?: string): number[] {

        let filteredMatchIndexes: number[] = []

        // Get either the house cards, or the player cards. If player not found return an empty array
        let cardsToFilter = this._house.cards
        if (playerKey) {
            let player = this._players.get(playerKey)
            if (!player) return []
            cardsToFilter = player.cards
        }

        // Filter and push indexes
        for (let i = 0; i < cardsToFilter.length; i++) {

            // Store card in a more readable variable
            let card = cardsToFilter[i]

            // If there is the filter option, and that filter option does not match the card option, continue on to the next loop
            if (filterOptions.face && filterOptions.face != card.face) continue
            if (filterOptions.value && filterOptions.value != card.value) continue
            if (filterOptions.suit && filterOptions.suit != card.suit) continue

            // If the code reaches down here, it means the card we are looking at has matched all the filter options
            filteredMatchIndexes.push(i)
        }
        return filteredMatchIndexes
    }

    /**If `playerKey` is left undefined, the total value for the house hand will be returned. If an invalid `playerKey` is passed, method returns 0.*/
    totalHandValue(playerKey?: string): number {
        let total = 0

        if (!playerKey) { // If no player name, return the total value of the house cards
            this._house.cards.forEach((card) => {
                total += card.value
            })
        } else { // Search for player if player name, and return total value of hand
            let player = this._players.get(playerKey)
            if (!player) return 0;

            player.cards.forEach((card) => {
                total += card.value
            })
        }
        return total
    }

    /**Player default will be the stored house player. Amount default will be 1.*/
    drawCard(drawOptions?: { playerKey?: string, amount?: number }): void {

        // If now draw options were input, draw one card for the house
        if (!drawOptions) return <unknown>this._house.cards.push(this._getCard()) as void

        let { playerKey, amount } = drawOptions
        if (!amount) amount = 1 // Set default in here since you cant in the parameter

        if (!playerKey) {
            for (let i = 0; i < amount; i++)
                this._house.cards.push(this._getCard())
        } else {
            let player = this._players.get(playerKey)
            if (!player) return

            for (let i = 0; i < amount; i++)
                player.cards.push(this._getCard())
        }
    }

    /**Returns a random card from the deck. If there are no cards left to draw, first make a new deck and draw a random card from that new deck. */
    private _getCard(): Card {

        // If no cards left to draw, get a new deck
        if (this._deck.length == 0) this._deck = this._getNewDeck()

        // Get a random existing this._deck index, remove that card from the deck and return it.
        let randomCardIndex = Math.floor(Math.random() * this._deck.length);
        let card = this._deck[randomCardIndex]
        this._deck.splice(randomCardIndex, 1)
        return card
    }

    private _getNewDeck(): Card[] {
        return [
            { face: "2", value: 2, suit: "♦" }, { face: "3", value: 3, suit: "♦" }, { face: "4", value: 4, suit: "♦" }, { face: "5", value: 5, suit: "♦" }, { face: "6", value: 6, suit: "♦" }, { face: "7", value: 7, suit: "♦" }, { face: "8", value: 8, suit: "♦" }, { face: "9", value: 9, suit: "♦" }, { face: "10", value: 10, suit: "♦" }, { face: "J", value: 10, suit: "♦" }, { face: "Q", value: 10, suit: "♦" }, { face: "K", value: 10, suit: "♦" }, { face: "A", value: 11, suit: "♦" },
            { face: "2", value: 2, suit: "♥" }, { face: "3", value: 3, suit: "♥" }, { face: "4", value: 4, suit: "♥" }, { face: "5", value: 5, suit: "♥" }, { face: "6", value: 6, suit: "♥" }, { face: "7", value: 7, suit: "♥" }, { face: "8", value: 8, suit: "♥" }, { face: "9", value: 9, suit: "♥" }, { face: "10", value: 10, suit: "♥" }, { face: "J", value: 10, suit: "♥" }, { face: "Q", value: 10, suit: "♥" }, { face: "K", value: 10, suit: "♥" }, { face: "A", value: 11, suit: "♥" },
            { face: "2", value: 2, suit: "♠" }, { face: "3", value: 3, suit: "♠" }, { face: "4", value: 4, suit: "♠" }, { face: "5", value: 5, suit: "♠" }, { face: "6", value: 6, suit: "♠" }, { face: "7", value: 7, suit: "♠" }, { face: "8", value: 8, suit: "♠" }, { face: "9", value: 9, suit: "♠" }, { face: "10", value: 10, suit: "♠" }, { face: "J", value: 10, suit: "♠" }, { face: "Q", value: 10, suit: "♠" }, { face: "K", value: 10, suit: "♠" }, { face: "A", value: 11, suit: "♠" },
            { face: "2", value: 2, suit: "♣" }, { face: "3", value: 3, suit: "♣" }, { face: "4", value: 4, suit: "♣" }, { face: "5", value: 5, suit: "♣" }, { face: "6", value: 6, suit: "♣" }, { face: "7", value: 7, suit: "♣" }, { face: "8", value: 8, suit: "♣" }, { face: "9", value: 9, suit: "♣" }, { face: "10", value: 10, suit: "♣" }, { face: "J", value: 10, suit: "♣" }, { face: "Q", value: 10, suit: "♣" }, { face: "K", value: 10, suit: "♣" }, { face: "A", value: 11, suit: "♣" }
        ]
    }

}

export class Card {
    face: TCardFace
    value: number
    suit: TCardSuit
    /**Card.value defaults: 2-10 = face value; J-K = 10; A = 11;*/
    constructor(face: TCardFace, suit: TCardSuit, value?: number) {
        this.face = face
        this.suit = suit
        if (value) this.value = value;
        else {
            let dummyValue;
            if (face == "A") dummyValue = 11
            else if (face == "K") dummyValue = 10
            else if (face == "Q") dummyValue = 10
            else if (face == "J") dummyValue = 10
            else dummyValue = parseInt(face)
            this.value = dummyValue
        }
    }
}

export type TCardSuit = "♦" | "♥" | "♠" | "♣"
export type TCardFace = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"

export interface IPlayer {
    name: string,
    cards: Card[]
}