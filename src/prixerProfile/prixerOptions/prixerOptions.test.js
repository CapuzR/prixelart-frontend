import React from 'react';
import renderer from 'react-test-renderer';
import PrixerOptions from "./prixerOptions";

it('Login renders correctly', () => {
  const tree = renderer
    .create(<PrixerOptions />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});