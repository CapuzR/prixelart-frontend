import React from 'react';
import axios from 'axios';
import {
  render,
  screen,
  fireEvent,
  getByRole,
  within,
  getByText,
  waitFor,
} from '@testing-library/react';
import CreateAdmin from './createAdmin';
import adminRoles from './adminRoles.json';
import areaMock from './__mocks__/createAdmin';
import { act } from 'react-dom/test-utils';

// jest.mock("axios");

test('Se llenan correctamente los campos y se acciona el botón Crear', async () => {
  //   const roles = adminRoles;
  //   axios.post.mockResolvedValueOnce({ data: roles });
  //   axios.post.mockResolvedValueOnce(() => Promise.resolve({ data: roles }));

  await act(async () => {
    render(<CreateAdmin />);
    await waitFor(() => {
      expect(areaMock).toHaveBeenCalledTimes(1);
    });
  });

  const usernameInput = screen.getByRole('textbox', {
    name: /nombre de usuario/i,
  });
  fireEvent.change(usernameInput, { target: { value: 'john.doe' } });

  const areaSelect = screen.getByTestId('Área');

  // const areaSelect = getByTestId("Área");
  // fireEvent.change(areaSelect, { target: { value: 1 } });
  // fireEvent.mouseDown(areaSelect);
  console.log(getByRole(areaSelect, 'option', { name: 'Ventas' }));
  // const listbox = within(getByText("Área"));
  // console.log(areaSelect.querySelectorAll("option"));

  // fireEvent.mouseDown(areaSelect);
  // fireEvent.click(getByRole("option", { name: "Ventas" }));
  // fireEvent.click(listbox.getByText(/Ventas/i));

  const nombreInput = screen.getByRole('textbox', {
    name: /firstname/i,
  });
  fireEvent.change(nombreInput, { target: { value: 'John' } });

  const apellidoInput = screen.getByRole('textbox', {
    name: /Apellido/i,
  });
  fireEvent.change(apellidoInput, { target: { value: 'Doe' } });

  const correoInput = screen.getByRole('textbox', {
    name: /Correo electrónico/i,
  });
  fireEvent.change(correoInput, { target: { value: 'john.doe@example.com' } });

  const telefonoInput = screen.getByRole('textbox', {
    name: /Teléfono/i,
  });
  fireEvent.change(telefonoInput, { target: { value: '1234567890' } });

  //   const passwordInput = screen.getByRole("password", { name: /Contraseña/i });
  //   fireEvent.change(passwordInput, { target: { value: "password123" } });

  // Accionar el botón "Crear"
  const crearButton = screen.getByText('Crear');
  fireEvent.click(crearButton);

  // Realizar las aserciones correspondientes
  expect(usernameInput.value).toBe('john.doe');
  //   expect(areaInput.value).toBe("Ventas");
  expect(nombreInput.value).toBe('John');
  expect(apellidoInput.value).toBe('Doe');
  expect(correoInput.value).toBe('john.doe@example.com');
  expect(telefonoInput.value).toBe('1234567890');
  //   expect(passwordInput.value).toBe("password123");
  // ...
});
