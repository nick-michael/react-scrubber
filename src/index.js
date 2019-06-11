import React, { Component, createRef } from 'react';
import './scrubber.css';

const clamp = (min, max, val) => Math.min(Math.max(min, val), max);

export class Scrubber extends Component {
    barRef = createRef();
    state = {
        seeking: false,
        mouseX: null,
        touchId: null,
        touchX: null,
        hover: false,
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleSeekEnd);
        window.addEventListener('touchmove',this.handleTouchMove);
        window.addEventListener('touchend', this.handleTouchEnd);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleSeekEnd);
        window.removeEventListener('touchmove',this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }

    getPositionFromMouseX = () => {
        const { min, max } = this.props;
        const { mouseX, touchX } = this.state;
        const { x, width } = this.barRef.current.getBoundingClientRect();
        const cursorX = typeof touchX === 'number' ? touchX : mouseX || 0;
        const clampedX = clamp(x, x + width, cursorX);
        const decimal = ((clampedX - x) / width).toFixed(7);
        return (max - min) * decimal;
    }

    handleMouseMove = e => {
        this.setState({ mouseX: e.pageX }, () => {
            if (this.state.seeking) {
                this.props.onScrubChange(this.getPositionFromMouseX());
            }
        });
    }

    handleTouchMove = e => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.state.touchId);
        if (touch) {
            this.setState({ touchX: touch.pageX }, () => {
                if (this.state.seeking) {
                    this.props.onScrubChange(this.getPositionFromMouseX());
                }
            });
        }
    }

    handleSeekStart = e => {
        this.setState({ seeking: true, mouseX: e.pageX }, () => {
            this.props.onScrubStart(this.getPositionFromMouseX());
        });
    }

    handleTouchStart = e => {
        const touch = e.changedTouches[0];
        this.setState({ hover: true, seeking: true, touchId: touch.identifier, touchX: touch.pageX }, () => {
            this.props.onScrubStart(this.getPositionFromMouseX());
        });
    }

    handleSeekEnd = () => {
        if (this.state.seeking) {
            this.props.onScrubEnd(this.getPositionFromMouseX());
            this.setState({ seeking: false, mouseX: null  });
        }
    }

    handleTouchEnd = e => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.state.touchId);
        if (touch && this.state.seeking) {
            this.props.onScrubEnd(this.getPositionFromMouseX());
            this.setState({ hover: false, seeking: false, touchX: null, touchId: null });
        }
    }

    render() {
        const { className, value, min, max, bufferPosition = 0 } = this.props;
        const valuePercent = ((clamp(min, max, value) / (max - min)) * 100).toFixed(5);
        const bufferPercent = bufferPosition && ((clamp(min, max, bufferPosition) / (max - min)) * 100).toFixed(5);

        const classes = ['scrubber'];
        if (this.state.hover) classes.push('hover');
        if (className) classes.push(className);

        return (
            <div
                className={classes.join(' ')}
                onMouseDown={this.handleSeekStart}
                onTouchStart={this.handleTouchStart}
                onTouchEnd={e => e.preventDefault()}
                onMouseOver={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}
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
