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
    vertical?: boolean;
    onScrubStart?: (value: number) => void;
    onScrubEnd?: (value: number) => void;
    onScrubChange?: (value: number) => void;
    markers?: number[];
    [key: string]: any;
};

type Nullable<T> = T | null;

type ScrubberState = {
    seeking: boolean;
    mouseX: Nullable<number>;
    mouseY: Nullable<number>;
    touchId: Nullable<number>;
    touchX: Nullable<number>;
    touchY: Nullable<number>;
    hover: boolean;
};

export class Scrubber extends Component<ScrubberProps> {
    barRef = createRef<HTMLDivElement>();
    state: ScrubberState = {
        seeking: false,
        mouseX: null,
        mouseY: null,
        touchId: null,
        touchX: null,
        touchY: null,
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
        const cursor = typeof touchX === 'number' ? touchX : mouseX || 0;
        const clamped = clamp(left, left + width, cursor);
        const decimal = round((clamped - left) / width, 7);
        return round((max - min) * decimal, 7);
    }
    getPositionFromMouseY = (): number => {
        const barDomNode = this.barRef.current;
        if (!barDomNode) {
            return 0;
        }
        const { min, max } = this.props;
        const { mouseY, touchY } = this.state;
        const { bottom, height } = barDomNode.getBoundingClientRect();
        const cursor = typeof touchY === 'number' ? touchY : mouseY || 0;
        const clamped = clamp(bottom - height, bottom, cursor);
        const decimal = round((bottom - clamped) / height, 7);
        return round((max - min) * decimal, 7);
    }

    getPositionFromCursor = (): number => {
        const { vertical } = this.props;
        return vertical ? this.getPositionFromMouseY() : this.getPositionFromMouseX();
    }

    handleMouseMove = (e: MouseEvent) => {
        this.setState({ mouseX: e.pageX, mouseY: e.pageY }, () => {
            if (this.state.seeking && this.props.onScrubChange) {
                this.props.onScrubChange(this.getPositionFromCursor());
            }
        });
    }

    handleTouchMove = (e: TouchEvent) => {
        if (this.state.seeking) {
            e.preventDefault();
        }

        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.state.touchId);
        if (touch) {
            this.setState({ touchX: touch.pageX, touchY: touch.pageY }, () => {
                if (this.state.seeking && this.props.onScrubChange) {
                    this.props.onScrubChange(this.getPositionFromCursor());
                }
            });
        }
    }

    handleSeekStart = (e: React.MouseEvent<HTMLDivElement>) => {
        this.setState({ seeking: true, mouseX: e.pageX, mouseY: e.pageY }, () => {
            if (this.props.onScrubStart) {
                this.props.onScrubStart(this.getPositionFromCursor());
            }
        });
    }

    handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.changedTouches[0];
        this.setState({ hover: true, seeking: true, touchId: touch.identifier, touchX: touch.pageX, touchY: touch.pageY }, () => {
            if (this.props.onScrubStart) {
                this.props.onScrubStart(this.getPositionFromCursor());
            }
        });
    }

    handleSeekEnd = () => {
        if (this.state.seeking) {
            if (this.props.onScrubEnd) {
                this.props.onScrubEnd(this.getPositionFromCursor());
            }
            this.setState({ seeking: false, mouseX: null, mouseY: null  });
        }
    }

    handleTouchEnd = (e: TouchEvent) => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.state.touchId);
        if (touch && this.state.seeking) {
            if (this.props.onScrubEnd) {
                this.props.onScrubEnd(this.getPositionFromCursor());
            }
            this.setState({ hover: false, seeking: false, touchX: null, touchY: null, touchId: null });
        }
    }

    renderMarkers = () => {
        const { vertical, markers } = this.props;
        if (markers) {
            return markers.map((value, index) => {
                const valuePercent = this.getValuePercent(value);
                return <div key={index} className="bar__marker" style={{[vertical ? 'bottom' : 'left']: `${valuePercent}%`}} />
            }
            );
        }
        return null;
    }

    getValuePercent = (value: number) => {
        const { min, max } = this.props;
        return ((clamp(min, max, value) / (max - min)) * 100).toFixed(5);
    }

    render() {
        const { className, value, bufferPosition = 0, vertical } = this.props;
        const valuePercent = this.getValuePercent(value);
        const bufferPercent = this.getValuePercent(bufferPosition);

        const classes = ['scrubber', vertical ? 'vertical' : 'horizontal'];
        if (this.state.hover) classes.push('hover');
        if (this.state.seeking) classes.push('seeking');
        if (className) classes.push(className);

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
                    <div className="bar__buffer" style={{ [vertical ? 'height' : 'width']: `${bufferPercent}%` }} />
                    {this.renderMarkers()}
                    <div className="bar__progress" style={{ [vertical ? 'height' : 'width']: `${valuePercent}%` }} />
                    <div className="bar__thumb" style={{ [vertical ? 'bottom' : 'left']: `${valuePercent}%` }} />
                </div>
            </div>
        );
    }
};
