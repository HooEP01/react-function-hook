import { useEffect, useRef, useState } from 'react';

type Func = {
    (options?: { signal: AbortSignal }, ...args: any[]): Promise<any>;
}

type ErrorItem = {
    isError: boolean;
    message?: string;
}

type Retry = {
    times: number;
    duration: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useFunction = (func: Func, ...args: any[]) => {
    const [isLoad, setIsLoad] = useState(false);
    const [isError, setIsError] = useState<ErrorItem>({ isError: false });
    const [retry, setRetry] = useState<Retry>({ times: 3, duration: 1000});

    const isLoadRef = useRef(isLoad);
    const isErrorRef = useRef(isError);

    useEffect(() => {
        isLoadRef.current = isLoad;
        isErrorRef.current = isError;
    }, [isLoad, isError]);

    const runFunc = async () => {
        setLoad(true);

        for (let attempt = 0; attempt <= retry.times; attempt++) {
            try {
                // TODO: Use decorator pattern
                const result = await func(...args);
                setLoad(false);
                return result;
            } catch (error: unknown) {
                let errorMessage = extractErrorMessage(error);

                setIsError({
                    isError: true,
                    message: errorMessage
                });

                if (attempt < retry.times) {
                    await delay(retry.duration);
                }
            } finally {
                setLoad(false);
            }
        }

    }

    const setLoad = (load?: boolean) => {
        if (load !== undefined) {
            setIsLoad(load);
            return;
        }
        setIsLoad((prev) => !prev);
    }

    function extractErrorMessage(error: unknown): string {
        if (typeof error === "string") {
            return error.toUpperCase();
        } else if (error instanceof Error) {
            return error.message;
        }
        return "An unknown error occurred";
    }

    return {
        retry,
        setRetry,
        isLoad,
        isLoadRef,
        setLoad,
        isError,
        isErrorRef,
        runFunc
    };
}


