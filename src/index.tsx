import React, { Component, createRef } from 'react';
import fromEntries from 'object.fromentries';

import './scrubber.css';

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
    onScrubStart?: (value: number) => void;
    onScrubEnd?: (value: number) => void;
    onScrubChange?: (value: number) => void;
    [key: string]: any;
};

type Nullable<T> = T | null;

type ScrubberState = {
    seeking: boolean;
    mouseX: Nullable<number>;
    touchId: Nullable<number>;
    touchX: Nullable<number>;
    hover: boolean;
};

export class Scrubber extends Component<ScrubberProps> {
    barRef = createRef<HTMLDivElement>();
    state: ScrubberState = {
        seeking: false,
        mouseX: null,
        touchId: null,
        touchX: null,
        hover: false,
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleSeekEnd);
        window.addEventListener('touchmove', this.handleTouchMove);
        window.addEventListener('touchend', this.handleTouchEnd);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleSeekEnd);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }

    getPositionFromMouseX = (): number => {
        const barDomNode = this.barRef.current;
        if (!barDomNode) {
            return 0;
        }
        const { min, max } = this.props;
        const { mouseX, touchX } = this.state;
        const { left, width } = barDomNode.getBoundingClientRect();
        const cursorX = typeof touchX === 'number' ? touchX : mouseX || 0;
        const clampedX = clamp(left, left + width, cursorX);
        const decimal = round((clampedX - left) / width, 7);
        return round((max - min) * decimal, 7);
    }

    handleMouseMove = (e: MouseEvent) => {
        this.setState({ mouseX: e.pageX }, () => {
            if (this.state.seeking && this.props.onScrubChange) {
                this.props.onScrubChange(this.getPositionFromMouseX());
            }
        });
    }

    handleTouchMove = (e: TouchEvent) => {
        if (this.state.seeking) {
            e.preventDefault();
        }

        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.state.touchId);
        if (touch) {
            this.setState({ touchX: touch.pageX }, () => {
                if (this.state.seeking && this.props.onScrubChange) {
                    this.props.onScrubChange(this.getPositionFromMouseX());
                }
            });
        }
    }

    handleSeekStart = (e: React.MouseEvent<HTMLDivElement>) => {
        this.setState({ seeking: true, mouseX: e.pageX }, () => {
            if (this.props.onScrubStart) {
                this.props.onScrubStart(this.getPositionFromMouseX());
            }
        });
    }

    handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.changedTouches[0];
        this.setState({ hover: true, seeking: true, touchId: touch.identifier, touchX: touch.pageX }, () => {
            if (this.props.onScrubStart) {
                this.props.onScrubStart(this.getPositionFromMouseX());
            }
        });
    }

    handleSeekEnd = () => {
        if (this.state.seeking) {
            if (this.props.onScrubEnd) {
                this.props.onScrubEnd(this.getPositionFromMouseX());
            }
            this.setState({ seeking: false, mouseX: null  });
        }
    }

    handleTouchEnd = (e: TouchEvent) => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.state.touchId);
        if (touch && this.state.seeking) {
            if (this.props.onScrubEnd) {
                this.props.onScrubEnd(this.getPositionFromMouseX());
            }
            this.setState({ hover: false, seeking: false, touchX: null, touchId: null });
        }
    }

    render() {
        const { className, value, min, max, bufferPosition = 0 } = this.props;
        const valuePercent = ((clamp(min, max, value) / (max - min)) * 100).toFixed(5);
        const bufferPercent = bufferPosition && ((clamp(min, max, bufferPosition) / (max - min)) * 100).toFixed(5);

        const classes = ['scrubber'];
        if (this.state.hover) classes.push('hover');
        if (this.state.seeking) classes.push('seeking');
        if (className) classes.push(className);

        const propsKeys = [
            'className',
            'value',
            'min',
            'max',
            'bufferPosition',
            'onScrubStart',
            'onScrubEnd',
            'onScrubChange',
        ];

        const customProps = filter(this.props, (key) => !propsKeys.includes(key));

        return (
            <div
                onMouseDown={this.handleSeekStart}
                onTouchStart={this.handleTouchStart}
                onTouchEnd={e => e.preventDefault()}
                onMouseOver={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}
                {...customProps}
                className={classes.join(' ')}
            >
                <div className="bar" ref={this.barRef}>
                    <div className="bar__buffer" style={{ width: `${bufferPercent}%` }} />
                    <div className="bar__progress" style={{ width: `${valuePercent}%` }} />
                    <div className="bar__thumb" style={{ left: `${valuePercent}%` }} />
                </div>
            </div>
        );
    }
};
