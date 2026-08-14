import { useEffect, useState } from "react";

/**
 * useState that persists to localStorage under `key` and rehydrates on mount.
 * Keeps the same API as useState so it can be used as a drop-in replacement.
 */
const usePersistentState = <T>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? (JSON.parse(stored) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Ignore storage errors (e.g. quota exceeded in private mode).
        }
    }, [key, value]);

    return [value, setValue] as const;
};

export default usePersistentState;
