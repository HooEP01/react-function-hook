"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFunction = void 0;
const react_1 = require("react");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const useFunction = (func, ...args) => {
    const [isLoad, setIsLoad] = (0, react_1.useState)(false);
    const [isError, setIsError] = (0, react_1.useState)({ isError: false });
    const [retry, setRetry] = (0, react_1.useState)({ times: 3, duration: 1000 });
    const isLoadRef = (0, react_1.useRef)(isLoad);
    const isErrorRef = (0, react_1.useRef)(isError);
    (0, react_1.useEffect)(() => {
        isLoadRef.current = isLoad;
        isErrorRef.current = isError;
    }, [isLoad, isError]);
    (0, react_1.useEffect)(() => {
        if (isLoad) {
            console.log('isLoad updated:', isLoad);
            console.log('isLoadRef updated:', isLoadRef.current);
        }
    }, [isLoad]);
    const runFunc = () => __awaiter(void 0, void 0, void 0, function* () {
        setLoad(true);
        for (let attempt = 0; attempt <= retry.times; attempt++) {
            try {
                // TODO: Use decorator pattern
                const result = yield func(...args);
                return result;
            }
            catch (error) {
                let errorMessage = extractErrorMessage(error);
                setIsError({
                    isError: true,
                    message: errorMessage
                });
                if (attempt < retry.times) {
                    yield delay(retry.duration);
                }
            }
            finally {
                setLoad(false);
            }
        }
    });
    const setLoad = (load) => {
        if (load !== undefined) {
            setIsLoad(load);
            return;
        }
        setIsLoad((prev) => !prev);
    };
    function extractErrorMessage(error) {
        if (typeof error === "string") {
            return error.toUpperCase();
        }
        else if (error instanceof Error) {
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
        setIsLoad,
        isError,
        isErrorRef,
        runFunc
    };
};
exports.useFunction = useFunction;
