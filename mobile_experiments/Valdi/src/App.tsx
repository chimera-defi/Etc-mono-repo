// Valdi Hello World App
// ACTUAL VALDI SYNTAX (not placeholder!)

import { Component } from 'valdi_core/src/Component';

class App extends Component {
  onRender() {
    <view backgroundColor='white' padding={30}>
      <label 
        color='black' 
        fontSize={32}
        fontWeight='bold'
        value='Hello, Valdi!' 
      />
      <label 
        color='#666666' 
        fontSize={18}
        marginTop={16}
        value='Welcome to your first Valdi app' 
      />
    </view>;
  }
}
