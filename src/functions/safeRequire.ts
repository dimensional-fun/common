/**
 * Used when the library is unsure whether a package has been installed.
 *
 * @param name The package name.
 */
export function safeRequire<T>(name: string): T | undefined {
    try {
        return require(name);
    } catch {
        return;
    }
}
