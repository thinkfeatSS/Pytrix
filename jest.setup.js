/* eslint-disable no-undef */

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const actual = jest.requireActual('react-native-screens');
  return {
    ...actual,
    enableScreens: jest.fn(),
  };
});

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockWebView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      postMessage: jest.fn(),
      injectJavaScript: jest.fn(),
    }));
    return React.createElement(View, { testID: 'mock-webview', ...props });
  });
  return {
    WebView: MockWebView,
    default: MockWebView,
  };
});
