import React from 'react';
// import renderer from 'react-test-renderer';
import AppBar from "./appBar";
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
jest.mock('@material-ui/icons/Menu', () => 'MenuIcon');
jest.mock('@material-ui/icons/AccountCircle', () => 'AccountCircle');
import axiosMock from "axios";
jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

// it('<AppBar /> renders correctly', () => {
//   const tree = renderer
//     .create(<AppBar />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

beforeEach(()=> {
  render(<AppBar />);
});

it.todo('Show login on Menu when user is not loggedin');
it.todo('Show logout on Menu when user is loggedin');
it('Logout succesfully', async()=> {
  const menuAppBar = screen.getByLabelText(/menu/i);
  const logout = screen.getByText('Cerrar Sesión');
  axiosMock.post.mockResolvedValue({data: {success: true}});

  await waitFor(async()=> {
    fireEvent.click(menuAppBar);
    fireEvent.click(logout);
  });

  expect(mockHistoryPush).toHaveBeenCalledWith({pathname: '/'});


});