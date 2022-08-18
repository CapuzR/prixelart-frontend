import React from 'react';
import PrixerRegistration from "./prixerRegistration";
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import axiosMock from "axios";
import Select from '@material-ui/core/Select';
jest.mock("axios");

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

beforeEach(()=> {
  render(<PrixerRegistration />);
});

// it('<PrixerRegistration /> renders correctly', () => {
//   const tree = renderer
//     .create(<PrixerRegistration />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

describe('with invalid input values', () => {
  it('display required errors for specialty, instagram, phone, country, city and T&C when empty', async()=> {
    const specialty = screen.getByText(/Especialidad/i);
    const instagram = screen.getByLabelText(/Instagram/i);
    const dateOfBirth = screen.getByLabelText(/Fecha de Nacimiento/i);
    const phone = screen.getByLabelText(/Teléfono/i);
    const country = screen.getByLabelText(/País/i);
    const city = screen.getByLabelText(/Ciudad/i);
    // const password = screen.getByLabelText(/Acepto/i);
    const prixerRegister = screen.getByText(/Guardar e ir a mi perfil/i);

    expect(specialty.textContent).toBe("Especialidad");
    expect(instagram.textContent).toBe("");
    expect(dateOfBirth.textContent).toBe("");
    expect(phone.textContent).toBe("");
    expect(country.textContent).toBe("");
    expect(city.textContent).toBe("");

    await waitFor(async()=> {
      fireEvent.submit(prixerRegister);
    });

    expect(screen.getByText('Por favor completa todos los campos requeridos.')).toBeTruthy();
  });
});

describe('with valid input values', () => {
  it('Inputting form login states works correctly', ()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Ambas"
        >
          <option value="Ambas">Ambas</option>
          <option value="fotografía">fotografía</option>
          <option value="Diseñador">Diseñador</option>
        </Select>
      </div>
    );

    const specialty = getByTestId("select");
    const instagram = screen.getByLabelText(/Instagram/i);
    const dateOfBirth = screen.getByLabelText(/Fecha de Nacimiento/i);
    const phone = screen.getByLabelText(/Teléfono/i);
    const country = screen.getByLabelText(/País/i);
    const city = screen.getByLabelText(/Ciudad/i);

    fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'fotografía', textContent: 'fotografía'}});
    fireEvent.change(instagram, {target: {value: '@capuzr', textContent: '@capuzr'}});
    fireEvent.change(dateOfBirth, {target: {value: '12/05/1991', textContent: '12/05/1991'}});
    fireEvent.change(phone, {target: {value: '+584143201028', textContent: '+584143201028'}});
    fireEvent.change(country, {target: {value: 'Venezuela', textContent: 'Venezuela'}});
    fireEvent.change(city, {target: {value: 'Caracas', textContent: 'Caracas'}});

    expect(specialty.childNodes[0].childNodes[0].textContent).toBe('fotografía');
    expect(instagram.textContent).toBe('@capuzr');
    expect(dateOfBirth.textContent).toBe('12/05/1991');
    expect(phone.textContent).toBe('+584143201028');
    expect(country.textContent).toBe('Venezuela');
    expect(city.textContent).toBe('Caracas');
  });
  
  it('calls api with data from form with all fields', async()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Ambas"
        >
          <option value="Ambas">Ambas</option>
          <option value="fotografía">fotografía</option>
          <option value="Diseñador">Diseñador</option>
        </Select>
      </div>
    );

    const specialty = getByTestId("select");
    const instagram = screen.getByLabelText(/Instagram/i);
    const dateOfBirth = screen.getByLabelText(/Fecha de Nacimiento/i);
    const phone = screen.getByLabelText(/Teléfono/i);
    const country = screen.getByLabelText(/País/i);
    const city = screen.getByLabelText(/Ciudad/i);
    const prixerRegister = screen.getByText(/Guardar e ir a mi perfil/i);
    const axMock = axiosMock.post.mockResolvedValue({data: {success: true}});

    await waitFor(async()=> {
      fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'Fotógrafía', textContent: 'Fotógrafía'}});
      fireEvent.change(instagram, {target: {value: '@capuzr', textContent: '@capuzr'}});
      fireEvent.change(dateOfBirth, {target: {value: '12/05/1991', textContent: '12/05/1991'}});
      fireEvent.change(phone, {target: {value: '+584143201028', textContent: '+584143201028'}});
      fireEvent.change(country, {target: {value: 'Venezuela', textContent: 'Venezuela'}});
      fireEvent.change(city, {target: {value: 'Caracas', textContent: 'Caracas'}});
    });

    await waitFor(async()=> {
      fireEvent.submit(prixerRegister);
    });

    expect(axMock).toHaveBeenCalled();
  });
  
  it('username already has a Prixer', async()=> {
  const mockCallback = jest.fn();
  const { getByTestId } = render(
    <div>
      <Select
        native={true}
        onChange={mockCallback}
        data-testid="select"
        defaultValue="Ambas"
      >
        <option value="Ambas">Ambas</option>
        <option value="fotografía">fotografía</option>
        <option value="Diseñador">Diseñador</option>
      </Select>
    </div>
  );

  const specialty = getByTestId("select");
  const instagram = screen.getByLabelText(/Instagram/i);
  const dateOfBirth = screen.getByLabelText(/Fecha de Nacimiento/i);
  const phone = screen.getByLabelText(/Teléfono/i);
  const country = screen.getByLabelText(/País/i);
  const city = screen.getByLabelText(/Ciudad/i);
  const prixerRegister = screen.getByText(/Guardar e ir a mi perfil/i);
  axiosMock.post.mockResolvedValue({data: {
    success: false,
    message: 'Disculpa, este usuario ya está asignado a un Prixer'
  }});

  await waitFor(async()=> {
    fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'fotografía', textContent: 'fotografía'}});
    fireEvent.change(instagram, {target: {value: '@capuzr', textContent: '@capuzr'}});
    fireEvent.change(dateOfBirth, {target: {value: '12/05/1991', textContent: '12/05/1991'}});
    fireEvent.change(phone, {target: {value: '+584143201028', textContent: '+584143201028'}});
    fireEvent.change(country, {target: {value: 'Venezuela', textContent: 'Venezuela'}});
    fireEvent.change(city, {target: {value: 'Caracas', textContent: 'Caracas'}});
  });

  await waitFor(async()=> {
    fireEvent.submit(prixerRegister);
  });
    expect(screen.getByText('Disculpa, este usuario ya está asignado a un Prixer')).toBeTruthy();
  });
  
  it('redirects to prixer Profile', async()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Ambas"
        >
          <option value="Ambas">Ambas</option>
          <option value="fotografía">fotografía</option>
          <option value="Diseñador">Diseñador</option>
        </Select>
      </div>
    );
  
    const specialty = getByTestId("select");
    const instagram = screen.getByLabelText(/Instagram/i);
    const dateOfBirth = screen.getByLabelText(/Fecha de Nacimiento/i);
    const phone = screen.getByLabelText(/Teléfono/i);
    const country = screen.getByLabelText(/País/i);
    const city = screen.getByLabelText(/Ciudad/i);
    const prixerRegister = screen.getByText(/Guardar e ir a mi perfil/i);
    axiosMock.post.mockResolvedValue({data: {
      success: true
    }});
  
    await waitFor(async()=> {
      fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'fotografía', textContent: 'fotografía'}});
      fireEvent.change(instagram, {target: {value: '@capuzr', textContent: '@capuzr'}});
      fireEvent.change(dateOfBirth, {target: {value: '12/05/1991', textContent: '12/05/1991'}});
      fireEvent.change(phone, {target: {value: '+584143201028', textContent: '+584143201028'}});
      fireEvent.change(country, {target: {value: 'Venezuela', textContent: 'Venezuela'}});
      fireEvent.change(city, {target: {value: 'Caracas', textContent: 'Caracas'}});
    });
  
    await waitFor(async()=> {
      fireEvent.submit(prixerRegister);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith({pathname:"/prixer-profile"});
  });
  
  it('renders snackbar with success message', async()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Ambas"
        >
          <option value="Ambas">Ambas</option>
          <option value="fotografía">fotografía</option>
          <option value="Diseñador">Diseñador</option>
        </Select>
      </div>
    );
  
    const specialty = getByTestId("select");
    const instagram = screen.getByLabelText(/Instagram/i);
    const dateOfBirth = screen.getByLabelText(/Fecha de Nacimiento/i);
    const phone = screen.getByLabelText(/Teléfono/i);
    const country = screen.getByLabelText(/País/i);
    const city = screen.getByLabelText(/Ciudad/i);
    const prixerRegister = screen.getByText(/Guardar e ir a mi perfil/i);
    axiosMock.post.mockResolvedValue({data: {
      success: true
    }});
  
    await waitFor(async()=> {
      fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'fotografía', textContent: 'fotografía'}});
      fireEvent.change(instagram, {target: {value: '@capuzr', textContent: '@capuzr'}});
      fireEvent.change(dateOfBirth, {target: {value: '12/05/1991', textContent: '12/05/1991'}});
      fireEvent.change(phone, {target: {value: '+584143201028', textContent: '+584143201028'}});
      fireEvent.change(country, {target: {value: 'Venezuela', textContent: 'Venezuela'}});
      fireEvent.change(city, {target: {value: 'Caracas', textContent: 'Caracas'}});
    });
  
    await waitFor(async()=> {
      fireEvent.submit(prixerRegister);
    });
    
    expect(screen.queryByText('Registro de Prixer exitoso.')).toBeInTheDocument();
  });
});