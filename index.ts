import { useEffect, useRef, useState } from 'react';

type Func<T> = {
    (signal: AbortSignal, ...args: any[]): Promise<T>;
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

export const useFunction = <T>(func: Func<T>, singleton = false) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState<ErrorItem>({ isError: false });
    const [retry, setRetry] = useState<Retry>({ times: 3, duration: 1000 });

    const isLoadingRef = useRef(false);
    const isErrorRef = useRef<ErrorItem>({ isError: false });

    // abort controller reference
    const abortControllerRef = useRef<AbortController | null>(null);

    const runFunc = async (customArgs: any[] = [], currentAttempt = 0, maxAttempts = retry.times): Promise<any> => {
        // is singleton
        if (isLoading && singleton) return;
        setLoad(true);

        if (abortControllerRef.current) {
            // abort the previous request
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        if (currentAttempt >= maxAttempts) {
            // reset error state
            setIsError({
                isError: true,
                message: "Max attempts reached"
            });

            // reset loading state
            setLoad(false);

            return null;
        }

        try {
            // call the function
            const result = await func(signal, ...customArgs);

            // store response data
            setData(result);

            // reset error state
            setIsError({ isError: false });

            // reset loading state
            setLoad(false);

            // return response data
            return result;
        } catch (error: unknown) {
            let errorMessage = extractErrorMessage(error);

            // error message
            setIsError({
                isError: true,
                message: errorMessage
            });

            // delay before retrying
            await delay(retry.duration);

            // retry the function
            return runFunc(customArgs, currentAttempt + 1, maxAttempts);
        }
    }

    // loading function
    const setLoad = (load?: boolean) => {
        if (load !== undefined) {
            setIsLoading(load);
            isLoadingRef.current = load;
            return;
        }
        setIsLoading((prev) => !prev);
        isLoadingRef.current = !isLoadingRef.current;
    }

    // error message function
    function extractErrorMessage(error: unknown): string {
        if (typeof error === "string") {
            return error.toUpperCase();
        } else if (error instanceof Error) {
            return error.message;
        }
        return "An unknown error occurred";
    }

    // store the current error state
    useEffect(() => {
        isErrorRef.current = isError;
    }, [isError])

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        setRetry,
        isLoading: isLoadingRef.current,
        isError: isErrorRef.current,
        runFunc,
        data
    };
}