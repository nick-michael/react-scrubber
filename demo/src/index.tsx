import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Scrubber } from 'react-scrubber';

import 'react-scrubber/lib/scrubber.css';
import './index.css';

class App extends Component {
    state = {
        value: 50,
        state: 'None',
    }

    handleScrubStart = (value: number) => {
        this.setState({ value, state: 'Scrub Start' });
    }

    handleScrubEnd = (value: number) => {
        this.setState({ value, state: 'Scrub End' });
    }

    handleScrubChange = (value: number) => {
        this.setState({ value, state: 'Scrub Change' });
    }

    render() {
        return (
            <div>
                <a className="github-link" href="https://github.com/nick-michael/react-scrubber" target="blank">
                    View Source Code &amp; Readme On Github
                </a>
                <h1 className="title">Welcome To React Scrubber!</h1>
                <div className="content-container">
                    <div className="scrubber-container" style={{ height: '20px' }}>
                        <Scrubber
                            min={0}
                            max={100}
                            value={this.state.value}
                            onScrubStart={this.handleScrubStart}
                            onScrubEnd={this.handleScrubEnd}
                            onScrubChange={this.handleScrubChange}
                        />
                    </div>
                    <div className="data">
                        <div className="data__state">State: {this.state.state}</div>
                        <div className="data__value">Value: {this.state.value}</div>
                    </div>
                    <br />
                    <div className="block">
                        <div className="description">The scrubber has default styling applied to it, here's what it looks like to start with!</div>
                        <div className="scrubber-container" style={{ height: '20px' }}>
                            <Scrubber
                                min={0}
                                max={100}
                                value={40}
                            />
                        </div>
                    </div>
                    <div className="block">
                        <div className="description">You can render a tooltip by passing options in the <code>"tooltip"</code> prop</div>
                        <br />
                        <div className="scrubber-container" style={{ height: '20px' }}>
                            <Scrubber
                                min={0}
                                max={100}
                                value={40}
                                tooltip={{
                                    enabledOnHover: true,
                                    enabledOnScrub: true,
                                }}
                            />
                        </div>
                    </div>
                    <div className="block">
                        <div className="description">
                            The scrubber will fill the width of it's container by default.
                            The scrubber will also fill the height of it's container, but this will only
                            be noticable for hover &amp; click detection, <strong>the bar graphic will stay the same height.</strong>
                        </div>
                        <div className="scrubber-container" style={{ height: '60px' }}>
                            <Scrubber
                                min={0}
                                max={100}
                                value={40}
                            />
                        </div>
                    </div>
                    <div className="block">
                        <div className="description">
                            Although this is a generic scrubber, there is support for an optional buffer bar and arbitrary markers.
                            <br />
                            <br />
                            Markers can be either a number or an object
                            containing <code>{`{ start: number, end: number, className: string }`}</code> where <code>end</code> and <code>className</code> are
                            optional. For numerical markers, or markers with no end point specified, a default width will be applied.
                        </div>
                        <div className="scrubber-container" style={{ height: '20px' }}>
                            <Scrubber
                                min={0}
                                max={100}
                                value={40}
                                bufferPosition={75}
                                markers={[
                                    { start: 10, end: 20, className: 'type-1' },
                                    { start: 24, end: 34, className: 'type-2' },
                                    { start: 70, end: 84, className: 'type-1' },
                                    { start: 42 },
                                    74,
                                    88,
                                ]}
                            />
                        </div>
                        <code className="codeblock" style={{ marginTop: '10px' }} >{
`<Scrubber
    min={0}
    max={100}
    value={40}
    bufferPosition={75}
    markers={[
        { start: 10, end: 20, className: 'type-1' },
        { start: 24, end: 34, className: 'type-2' },
        { start: 70, end: 84, className: 'type-1' },
        { start: 42 },
        74,
        88,
    ]}
/>`
                        }</code>
                    </div>
                    <div className="block">
                        <div className="description">
                            All the elements have class names so the style can be overriden. You can also pass down a class name into the className prop.
                            <br /><br />The scrubber will also have a 'hover' class applied on mouse enter and on touch.
                        </div>
                        <div className="scrubber-container" style={{ height: '80px' }}>
                            <Scrubber
                                className="labelled"
                                min={0}
                                max={100}
                                value={40}
                                bufferPosition={75}
                            />
                        </div>
                        <br />
                    </div>
                    <div className="block" style={{ textAlign: 'center' }}>
                        <div className="description" style={{ display: 'inline-block', width: '200px', verticalAlign: 'middle' }}>
                            Vertical scrubbing is possible using the <code>"vertical"</code> prop.
                        </div>
                        <div style={{ display: 'inline-block', width: '150px', verticalAlign: 'middle' }}>
                            <div className="scrubber-container" style={{ height: '80px', width: '20px', margin: 'auto' }}>
                                <Scrubber
                                    vertical
                                    min={0}
                                    max={100}
                                    value={40}
                                    tooltip={{
                                        enabledOnHover: true,
                                        enabledOnScrub: true,
                                    }}
                                />
                            </div>
                        </div>
                        <br />
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
