export class UtilRandom {

    /**UNDOCUMENTED */
    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**Returns a random integer in [0, n)*/ 
    static uniformInt(n: number): number {
        if (n <= 0) throw new TypeError("n must be a positive integer")
        return Math.floor(Math.random() * n);
    }

    /** Returns a random integer in [a, b) */
    static randInt(a: number, b: number): number {
        // `invalid range: [${a}, ${b})`
        if (a >= b) throw new TypeError(`b must be bigger than a`)
        return a + this.uniformInt(b - a);
    }

    // Rearranges the given array provided the array is not null using knuth's shuffle 
    static shuffle(array: Array<any>) {
        this.validateNotNull(array);
        for (let i = 0; i < array.length; i++) {
            let r = this.uniformInt(i + 1);
            let temp = array[i];
            array[i] = array[r];
            array[r] = temp;
        }
    }

    // VALIDATORS
    // Validate not null
    private static validateNotNull(x: Object) {
        if (x == null) {
            throw new TypeError("Argument must not be null")
        }
    }
}