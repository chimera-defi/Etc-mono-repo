/**
 * Tests for Valdi x React Native Hello World
 * 
 * Basic smoke tests to verify the app renders correctly.
 * More comprehensive UI testing can be done with Detox or
 * React Native Testing Library in a full testing setup.
 * 
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('App', () => {
  test('renders without crashing', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<App />);
    });
  });

  test('creates valid component tree', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<App />);
    });

    // Verify component tree exists
    expect(tree?.toJSON()).not.toBeNull();
  });

  test('snapshot matches', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<App />);
    });

    expect(tree?.toJSON()).toMatchSnapshot();
  });
});
