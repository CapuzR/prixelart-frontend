import React from 'react';
import UserRegistration from "./userRegistration";
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import axiosMock from "axios";
jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

beforeEach(()=> {
  render(<UserRegistration />);
});

// it('<UserRegistration /> renders correctly', () => {
//   const tree = renderer
//     .create(<UserRegistration />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

describe('with invalid input values', () => {

  it('display required errors for username, email, firstName, lastName, password and T&C when empty', ()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const register = screen.getByText(/Registrarme/i);

    expect(username.textContent).toBe("");
    expect(firstName.textContent).toBe("");
    expect(lastName.textContent).toBe("");
    expect(email.textContent).toBe("");
    expect(password.textContent).toBe("");
    
    fireEvent.change(username, { target: { value: '' } });
    fireEvent.change(firstName, { target: { value: '' } });
    fireEvent.change(lastName, { target: { value: '' } });
    fireEvent.change(email, { target: { value: '' } });
    fireEvent.change(password, { target: { value: '' } });
    fireEvent.submit(register);

    expect(screen.getByText('Por favor completa todos los campos requeridos.')).toBeTruthy();
  });

  it('invalid email: no @ nor .domain', async ()=> {  
    const emailField = screen.getByLabelText(/Correo/i);
    expect(emailField.textContent).toBe("");
    fireEvent.change(emailField, { target: { value: 'Test', textContent: 'Test' } });
    expect(screen.getByText('Por favor introduce un correo electrónico válido.')).toBeTruthy();
  });

  it('invalid email: no .domain', async ()=> {  
    const emailField = screen.getByLabelText(/Correo/i);
    expect(emailField.textContent).toBe("");
    fireEvent.change(emailField, { target: { value: 'Test@fkjsd', textContent: 'Test@fkjsd' } });
    expect(screen.getByText('Por favor introduce un correo electrónico válido.')).toBeTruthy();
  });

  it('invalid email: no @', async ()=> {  
    const emailField = screen.getByLabelText(/Correo/i);
    expect(emailField.textContent).toBe("");
    fireEvent.change(emailField, { target: { value: 'Test.com', textContent: 'Test.com' } });
    expect(screen.getByText('Por favor introduce un correo electrónico válido.')).toBeTruthy();
  });

  it('no characters after punctuation', async ()=> { 
    const emailField = screen.getByLabelText(/Correo/i); 
    expect(emailField.textContent).toBe("");
    fireEvent.change(emailField, { target: { value: 'Test@gmail.', textContent: 'Test@gmail.' } });
    expect(screen.getByText('Por favor introduce un correo electrónico válido.')).toBeTruthy();
  });

  it('invalid password',async ()=> {
    const passwordField = screen.getByLabelText("Contraseña");

    expect(passwordField.textContent).toBe("");
    
    fireEvent.change(passwordField, { target: { value: 'Test' } });


    //Más adelante sería ideal ubicar por palabras claves y no por textos completos para poder modificar detalles.
    expect(screen.getByText('Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.')).toBeTruthy();
  });
});

describe('with valid input values', () => {
  it('Inputting form login input states works correctly', ()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(username, {target: {value: 'rcapuz', textContent: 'rcapuz'}});
    fireEvent.change(firstName, {target: {value: 'Ricardo', textContent: 'Ricardo'}});
    fireEvent.change(lastName, {target: {value: 'Capuz', textContent: 'Capuz'}});
    fireEvent.change(email, {target: {value: 'rcapuz@prixelart.com', textContent: 'rcapuz@prixelart.com'}});
    fireEvent.change(password, {target: {value: 'Test123.*', textContent: 'Test123.*'}});

    expect(username.textContent).toBe('rcapuz');
    expect(firstName.textContent).toBe('Ricardo');
    expect(lastName.textContent).toBe('Capuz');
    expect(email.textContent).toBe('rcapuz@prixelart.com');
    expect(password.textContent).toBe('Test123.*');
  });
  
  it('calls api with data from form with all fields', async()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const register = screen.getByText(/Registrarme/i);
    const axMock = axiosMock.post.mockResolvedValue({data: {success: true}});

    expect(username.textContent).toBe('');
    expect(firstName.textContent).toBe('');
    expect(lastName.textContent).toBe('');
    expect(email.textContent).toBe('');
    expect(password.textContent).toBe('');

    await waitFor(async()=> {
      fireEvent.change(username, {target: {value: 'rcapuz', textContent: 'rcapuz'}});
      fireEvent.change(firstName, {target: {value: 'Ricardo', textContent: 'Ricardo'}});
      fireEvent.change(lastName, {target: {value: 'Capuz', textContent: 'Capuz'}});
      fireEvent.change(email, {target: {value: 'rcapuz@prixelart.com', textContent: 'rcapuz@prixelart.com'}});
      fireEvent.change(password, {target: {value: 'Test123.*', textContent: 'Test123.*'}});
    });
    
    await waitFor(async()=> {
      fireEvent.click(register);
    });

    expect(axMock).toHaveBeenCalled();
  });
  
  it('username already registered', async()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const register = screen.getByText(/Registrarme/i);
    axiosMock.post.mockResolvedValue({data: {info: 'error_username', message: 'Disculpa, el nombre de usuario ya está registrado.'}})

    expect(username.textContent).toBe('');
    expect(firstName.textContent).toBe('');
    expect(lastName.textContent).toBe('');
    expect(email.textContent).toBe('');
    expect(password.textContent).toBe('');

    await waitFor(async()=> {
      fireEvent.change(username, {target: {value: 'rcapuz', textContent: 'rcapuz'}});
      fireEvent.change(firstName, {target: {value: 'Ricardo', textContent: 'Ricardo'}});
      fireEvent.change(lastName, {target: {value: 'Capuz', textContent: 'Capuz'}});
      fireEvent.change(email, {target: {value: 'rcapuz@prixelart.com', textContent: 'rcapuz@prixelart.com'}});
      fireEvent.change(password, {target: {value: 'Test123.*', textContent: 'Test123.*'}});
    });
    
    await waitFor(async()=> {
      fireEvent.click(register);
    });

    expect(screen.getByText('Disculpa, el nombre de usuario ya está registrado.')).toBeTruthy();
  });

  it('email already registered', async()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const register = screen.getByText(/Registrarme/i);
    axiosMock.post.mockResolvedValue({data: {info: 'error_email', message: 'Disculpa, el correo del usuario ya está registrado.'}})

    expect(username.textContent).toBe('');
    expect(firstName.textContent).toBe('');
    expect(lastName.textContent).toBe('');
    expect(email.textContent).toBe('');
    expect(password.textContent).toBe('');

    await waitFor(async()=> {
      fireEvent.change(username, {target: {value: 'rcapuz', textContent: 'rcapuz'}});
      fireEvent.change(firstName, {target: {value: 'Ricardo', textContent: 'Ricardo'}});
      fireEvent.change(lastName, {target: {value: 'Capuz', textContent: 'Capuz'}});
      fireEvent.change(email, {target: {value: 'rcapuz@prixelart.com', textContent: 'rcapuz@prixelart.com'}});
      fireEvent.change(password, {target: {value: 'Test123.*', textContent: 'Test123.*'}});
    });
    
    await waitFor(async()=> {
      fireEvent.click(register);
    });

    expect(screen.getByText('Disculpa, el correo del usuario ya está registrado.')).toBeTruthy();
  });
  
  it('redirects to prixer Registration', async ()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const register = screen.getByText(/Registrarme/i);
    const pageTitle = screen.getByText("Registrar");
    axiosMock.post.mockResolvedValue({data: {success: true}});

    expect(pageTitle.textContent).toBe("Registrar");

    await waitFor(async()=> {
      fireEvent.change(username, {target: {value: 'rcapuz', textContent: 'rcapuz'}});
      fireEvent.change(firstName, {target: {value: 'Ricardo', textContent: 'Ricardo'}});
      fireEvent.change(lastName, {target: {value: 'Capuz', textContent: 'Capuz'}});
      fireEvent.change(email, {target: {value: 'rcapuz@prixelart.com', textContent: 'rcapuz@prixelart.com'}});
      fireEvent.change(password, {target: {value: 'Test123.*', textContent: 'Test123.*'}});
    });
    
    await waitFor(async()=> {
      fireEvent.click(register);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith({pathname: '/registrar/prixer'});
  });
  
  it('renders snackbar with success message', async()=> {
    const username = screen.getByLabelText(/Usuario/i);
    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const email = screen.getByLabelText(/Correo electrónico/i);
    const password = screen.getByLabelText(/Contraseña/i);
    const register = screen.getByText(/Registrarme/i);
    axiosMock.post.mockResolvedValue({data: {success: false}})
  
    expect(username.textContent).toBe('');
    expect(firstName.textContent).toBe('');
    expect(lastName.textContent).toBe('');
    expect(email.textContent).toBe('');
    expect(password.textContent).toBe('');

    await waitFor(async()=> {
      fireEvent.change(username, {target: {value: 'rcapuz', textContent: 'rcapuz'}});
      fireEvent.change(firstName, {target: {value: 'Ricardo', textContent: 'Ricardo'}});
      fireEvent.change(lastName, {target: {value: 'Capuz', textContent: 'Capuz'}});
      fireEvent.change(email, {target: {value: 'rcapuz@prixelart.com', textContent: 'rcapuz@prixelart.com'}});
      fireEvent.change(password, {target: {value: 'Test123.*', textContent: 'Test123.*'}});
    });

    await waitFor(async()=> {
      fireEvent.click(register);
    });


    expect(screen.queryByText('Registro de usuario exitoso.')).toBeInTheDocument();
  });
});