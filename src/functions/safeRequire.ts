export function safeRequire<T>(name: string): T | undefined {
    try {
        return require(name);
    } catch {
        return;
    }
}
