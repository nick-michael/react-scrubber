# [react-scrubber](https://nick-michael.github.io/react-scrubber/)
A simple React scrubber component with touch controls, styling, and event handlers. Integrated TypeScript support. See more information and a live demo at [https://nick-michael.github.io/react-scrubber/](https://nick-michael.github.io/react-scrubber/)

The code for the above demo can be found inside the repository in the '/demo' folder.

## Dependencies
React is listed as a peer dependency. React should be added as a dependency to your project. The component provides its styling with a CSS stylesheet (`scrubber.css`) file, so you'll need to import it and have webpack set up to handle css imports. The typical combination of `style-loader` and `css-loader` works great!

## Usage
```js
import  React, { Component } from  'react';
import { Scrubber, ScrubberProps } from 'react-scrubber';
// Note: ScrubberProps is a TypeScript interface and is not used for JS projects

import 'react-scrubber/lib/scrubber.css'

class App extends Component {
  state = {
    value: 50,
    state: 'None',
  }

  handleScrubStart  = (value:  number) => {
    this.setState({ value, state:  'Scrub Start' });
  }

  handleScrubEnd  = (value:  number) => {
    this.setState({ value, state:  'Scrub End' });
  }

  handleScrubChange  = (value:  number) => {
    this.setState({ value, state:  'Scrub Change' });
  }

  render() {
    return (
      <div  className="scrubber-container"  style={{ height:  '20px' }}>
        <Scrubber
          min={0}
          max={100}
          value={this.state.value}
          onScrubStart={this.handleScrubStart}
          onScrubEnd={this.handleScrubEnd}
          onScrubChange={this.handleScrubChange}
        />
      </div>
    );
  }
}
```

## Props
| Name | Type | Required | Description |
|--|--|--|--|
| className | string | No | Sets the class name for the scrubber div
| value | number | Yes | Set current value of slider
| min | number | Yes | The minimum value of the slider
| max | number | Yes | The maximum value of the slider
| bufferPosition | number | No | Some number higher than the value, used to render a 'buffer' indicator
| vertical | boolean | No | The scrubber will render vertically
| onScrubStart | function | No | Called on mouse down or touch down
| onScrubEnd | function | No | Called on mouse up or touch up while scrubbing
| onScrubChange | function | No | Called on mouse move while scrubbing
| markers | Array<number \| { start: number, end?: number, className?: string }> | No | Adds yellow indicators to the scrubber bar
| tooltip | {<br /> &emsp;enabledOnHover?: boolean;<br /> &emsp;enabledOnScrub?: boolean;<br /> &emsp;className?: string;<br /> &emsp;formatString?: (value: number) => string;<br/>} | No | Renders a tooltip while hovering/scrubbing
| custom props | any | No | Any other props will be applied to the outermost 'scrubber' div
