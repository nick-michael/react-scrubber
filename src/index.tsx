import React, { useEffect, useMemo, useRef, useState } from 'react';
import fromEntries from 'object.fromentries';
import { useRefState } from './use-ref-state';

const clamp = (min: number, max: number, val: number): number => Math.min(Math.max(min, val), max);
const round = (val: number, dp: number) => parseFloat(val.toFixed(dp));

// Use Object.fromEntries when available
const filter = (object: Object, fn: (key: string, val: any) => boolean) => fromEntries(Object.entries(object).filter(([key, val]) => fn(key, val)));

export type ScrubberProps = {
    className?: string,
    value: number;
    min: number;
    max: number;
    bufferPosition?: number;
    vertical?: boolean;
    onScrubStart?: (value: number) => void;
    onScrubEnd?: (value: number) => void;
    onScrubChange?: (value: number) => void;
    markers?: number[];
    [key: string]: any;
};

type Nullable<T> = T | null;

type Position = {
    x : Nullable<number>;
    y : Nullable<number>;
};

export function Scrubber(props: ScrubberProps) {
    const barRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState<Position>({ x: null, y: null });
    const [touchPosition, setTouchPosition] = useState<Position>({ x: null, y: null });
    const [isHovered, setIsHovered] = useState(false);

    const [touchId, setTouchId, touchIdRef] = useRefState<Nullable<number>>(null);
    const [isSeeking, setIsSeeking, isSeekingRef] = useRefState(false);

    
    function getPositionFromMouseX(): number {
        const barDomNode = barRef.current;
        if (!barDomNode) {
            return 0;
        }
        const { min, max } = props;
        const { x: mouseX } = mousePosition;
        const { x: touchX } = touchPosition;
        const { left, width } = barDomNode.getBoundingClientRect();
        const cursor = typeof touchX === 'number' ? touchX : mouseX || 0;
        const clamped = clamp(left, left + width, cursor);
        const decimal = round((clamped - left) / width, 7);
        return round((max - min) * decimal, 7) + min;
    }

    function getPositionFromMouseY(): number {
        const barDomNode = barRef.current;
        if (!barDomNode) {
            return 0;
        }
        const { min, max } = props;
        const { y: mouseY } = mousePosition;
        const { y: touchY } = touchPosition;
        const { bottom, height } = barDomNode.getBoundingClientRect();
        const cursor = typeof touchY === 'number' ? touchY : mouseY || 0;
        const clamped = clamp(bottom - height, bottom, cursor);
        const decimal = round((bottom - clamped) / height, 7);
        return round((max - min) * decimal, 7) + min;
    }

    function getPositionFromCursor(): number {
        const { vertical } = props;
        return vertical ? getPositionFromMouseY() : getPositionFromMouseX();
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isSeekingRef.current) {
            return;
        }

        setMousePosition({ x: e.pageX, y: e.pageY });
    }

    function handleTouchMove(e: TouchEvent) {
        if (!isSeekingRef.current) {
            return;
        }

        e.preventDefault();
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
        if (touch) {
            setTouchPosition({ x: touch.pageX, y: touch.pageY });
        }
    }

    function handleSeekStart(e: React.MouseEvent<HTMLDivElement>) {
        setIsSeeking(true);
        setMousePosition({ x: e.pageX, y: e.pageY });
    }

    function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
        const touch = e.changedTouches[0];
        setIsHovered(true);
        setIsSeeking(true);
        setTouchId(touch.identifier);
        setTouchPosition({ x: touch.pageX, y: touch.pageY });
    }

    function handleSeekEnd() {
        setIsSeeking(false);
        setMousePosition({ x: null, y: null });
    }

    function handleTouchEnd(e: TouchEvent) {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
        if (touch) {
            setIsSeeking(false);
            setIsHovered(false);
            setTouchPosition({ x: null, y: null });
            setTouchId(null);
        }
    }

    function renderMarkers() {
        const { vertical, markers } = props;
        if (markers) {
            return markers.map((value, index) => {
                const valuePercent = getValuePercent(value);
                return <div key={index} className="bar__marker" style={{ [vertical ? 'bottom' : 'left']: `${valuePercent}%` }} />
            }
            );
        }
        return null;
    }

    function getValuePercent(value: number) {
        const { min, max } = props;
        return (((clamp(min, max, value) - min) / (max - min)) * 100).toFixed(5);
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleSeekEnd);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleSeekEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
    }, []);

    useEffect(() => {
        if (isSeeking && props.onScrubChange) {
            props.onScrubChange(getPositionFromCursor());
        }
    }, [mousePosition, touchPosition]);

    useEffect(() => {
        if (isSeeking && props.onScrubStart) {
            props.onScrubStart(getPositionFromCursor());
        } else if (!isSeeking && props.onScrubEnd) {
            props.onScrubEnd(getPositionFromCursor());
        }
    }, [isSeeking]);

    const valuePercent = useMemo(() => {
        return getValuePercent(props.value);
    }, [props.value]);

    const bufferPercent = useMemo(() => {
        return getValuePercent(props.bufferPosition || 0);
    }, [props.bufferPosition]);

    const classNames = useMemo(() => {
        const classes = ['scrubber', props.vertical ? 'vertical' : 'horizontal'];
        if (isHovered) classes.push('hover');
        if (isSeeking) classes.push('seeking');
        if (props.className) classes.push(props.className);
        return classes.join(' ');
    }, [isHovered, isSeeking, props.vertical, props.className]);

    const propsKeys = [
        'className',
        'value',
        'min',
        'max',
        'bufferPosition',
        'vertical',
        'onScrubStart',
        'onScrubEnd',
        'onScrubChange',
        'markers',
    ];

    const customProps = filter(props, (key) => !propsKeys.includes(key));

    return (
        <div
            onMouseDown={handleSeekStart}
            onTouchStart={handleTouchStart}
            onTouchEnd={e => e.preventDefault()}
            onMouseOver={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...customProps}
            className={classNames}
        >
            <div className="bar" ref={barRef}>
                <div className="bar__buffer" style={{ [props.vertical ? 'height' : 'width']: `${bufferPercent}%` }} />
                {renderMarkers()}
                <div className="bar__progress" style={{ [props.vertical ? 'height' : 'width']: `${valuePercent}%` }} />
                <div className="bar__thumb" style={{ [props.vertical ? 'bottom' : 'left']: `${valuePercent}%` }} />
            </div>
        </div>
    );
}
