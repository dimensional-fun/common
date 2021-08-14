const EPOCH = 1420070400000;
let INCREMENT = 0;

export class Snowflake {
    /**
     * Transforms an ID into binary.
     *
     * @param snowflake The ID to transform.
     */
    static toBinary(snowflake: snowflake): string {
        let binary = "",
            high = parseInt(snowflake.slice(0, -10)) || 0,
            low = parseInt(snowflake.slice(-10)) || 0;

        while (low > 0 || high > 0) {
            binary = String(low & 1) + binary;
            low = Math.floor(low / 2);
            if (high > 0) {
                low += 5000000000 * (high % 2);
                high = Math.floor(high / 2);
            }
        }

        return binary.trim();
    }

    /**
     * Transforms an ID from binary to a decimal string.
     *
     * @param binary The binary string to be transformed.
     */
    static fromBinary(binary: string): snowflake {
        let decimal = "";

        while (binary.length > 50) {
            const high = parseInt(binary.slice(0, -32), 2),
                low = parseInt((high % 20).toString(2) + binary.slice(-32), 2);

            decimal = (low % 10).toString() + decimal;
            binary =
                Math.floor(high / 10).toString(2) +
                Math.floor(low / 10)
                    .toString(2)
                    .padStart(32, "0");
        }

        let bin = parseInt(binary, 2);
        while (bin > 0) {
            decimal = (bin % 10).toString() + decimal;
            bin = Math.floor(bin / 10);
        }

        return decimal.trim();
    }

    /**
     * Deconstructs a Discord Snowflake.
     *
     * @param snowflake The snowflake to deconstruct.
     * @param epoch The epoch to use when deconstructing.
     */
    static deconstruct(snowflake: snowflake, epoch = EPOCH): DeconstructedSnowflake {
        const binary = Snowflake.toBinary(snowflake).padStart(64, "0");

        return {
            timestamp: parseInt(binary.substring(0, 42), 2) + epoch,
            workerId: parseInt(binary.substring(42, 47), 2),
            processId: parseInt(binary.substring(47, 52), 2),
            increment: parseInt(binary.substring(52, 64), 2),
            binary
        };
    }

    /**
     * Generates a new snowflake.
     *
     * @param options The options to use when generating a snowflake.
     */
    static generate({ epoch = EPOCH, timestamp = Date.now() }: GenerateSnowflakeOptions = {}): snowflake {
        if (epoch instanceof Date) {
            epoch = epoch.getTime();
        }

        if (timestamp instanceof Date) {
            timestamp = timestamp.getTime();
        }

        if (INCREMENT >= 4095) {
            INCREMENT = 0;
        }

        const binary = `${(timestamp - epoch)
            .toString(2)
            .padStart(42, "0")}0000100000${(++INCREMENT)
            .toString(2)
            .padStart(12, "0")}`;

        return Snowflake.fromBinary(binary.trim());
    }
}

/**
 * A Twitter snowflake, except the default epoch is 2015-01-01T00:00:00.000Z
 *
 * ```
 * If we have a snowflake '266241948824764416' we can represent it as binary:
 *
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *           number of ms since epoch           worker  pid    increment
 * ```
 */
export type snowflake = string;

export interface GenerateSnowflakeOptions {
    timestamp?: Date | number;
    epoch?: Date | number;
}

export interface DeconstructedSnowflake {
    binary: string;
    timestamp: number;
    workerId: number;
    processId: number;
    increment: number;
}
