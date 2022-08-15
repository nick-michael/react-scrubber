import { MutableRefObject, useRef, useState } from 'react';

type useRefStateHook<T> = [T, (t: T) => void, MutableRefObject<T>];

export function useRefState<T>(initialValue: T): useRefStateHook<T> {
    const [state, setState] = useState(initialValue);
    const stateRef = useRef(initialValue);
    const setRefState = (value: T) => {
        stateRef.current = value;
        setState(value);
    };

    return [state, setRefState, stateRef];
}
