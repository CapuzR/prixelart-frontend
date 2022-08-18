import React from 'react';
import renderer from 'react-test-renderer';
import BottomAppBar from "./bottomAppBar";

jest.mock('@material-ui/icons/Menu', () => 'MenuIcon')
jest.mock('@material-ui/icons/AccountCircle', () => 'AccountCircle')

it('<BottomAppBar /> renders correctly', () => {
  const tree = renderer
    .create(<BottomAppBar />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});