import React from 'react';
import renderer from 'react-test-renderer';
import PrixerProfile from "./prixerProfile";

jest.mock('@material-ui/core/CssBaseline', () => 'CssBaseline')
jest.mock('../sharedComponents/appBar/appBar', () => 'AppBar')
jest.mock('./userData/userData', () => 'UserData')
jest.mock('./prixerOptions/prixerOptions', () => 'PrixerOptions')
jest.mock('./grid/grid', () => 'Grid')

it('<PrixerProfile /> renders correctly', () => {
  const tree = renderer
    .create(<PrixerProfile />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});