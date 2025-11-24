// HelloWorld Component
// ACTUAL VALDI SYNTAX

import { Component } from 'valdi_core/src/Component';

class HelloWorld extends Component {
  private message: string;

  constructor(message: string = 'Hello, Valdi!') {
    super();
    this.message = message;
  }

  onRender() {
    <view padding={20} alignItems='center'>
      <label 
        fontSize={24} 
        color='#333333'
        value={this.message} 
      />
    </view>;
  }
}
