import React from 'react';
import renderer from 'react-test-renderer';
import Grid from "./grid";

it('Login renders correctly', () => {
  const tree = renderer
    .create(<Grid />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

describe('Grid tests', ()=> {
  it.todo('Shows the images.');
  it.todo('Shows the name of the images.');
  it.todo('Shows the name of the author of the images.');
});