import React from 'react';
// import renderer from 'react-test-renderer';
import UserData from "./userData";
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import Select from '@material-ui/core/Select';
import axiosMock from "axios";
jest.mock("axios");

beforeEach( async()=> {
  const axMockPost = axiosMock.post.mockResolvedValue({
    data: {
      username: 'rcapuz',
      firstName: 'Ricardo',
      lastName: 'Capuz',
      email: 'rcapuz@prixelart.com',
      specialty: 'Diseño',
      instagram: 'capuzr',
      dateOfBirth: '1991/05/12',
      description: 'Fuck it and leap up.',
      country: 'Venezuela',
      city: 'Caracas'
    }});

    const axMockGet = axiosMock.get.mockResolvedValue({
      data: {
        username: 'rcapuz',
        firstName: 'Ricardo',
        lastName: 'Capuz',
        email: 'rcapuz@prixelart.com',
        specialty: 'Diseño',
        instagram: 'capuzr',
        dateOfBirth: '1991/05/12',
        description: 'Fuck it and leap up.',
        country: 'Venezuela',
        city: 'Caracas'
      }});
  await waitFor(()=> {
    render(<UserData />);
  });
});

// it('<UserData /> renders correctly', () => {
//   const tree = renderer
//     .create(<UserData />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

describe('Display Prixer profile data correctly', ()=>{
  it('Display basic data correctly', ()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Fotógrafía y Diseño"
        >
          <option value="Fotógrafía y Diseño">Fotógrafía y Diseño</option>
          <option value="Fotografía">Fotografía</option>
          <option value="Diseño">Diseño</option>
        </Select>
      </div>
    );

    expect(screen.getByText(/rcapuz/i)).toBeTruthy();  
    expect(screen.getByText(/Ricardo Capuz/i)).toBeTruthy();  
    expect(getByTestId("select")).toBeTruthy();  
    expect(screen.getByText(/capuzr/i)).toBeTruthy();   

  });

  it('Clicking pen change to edit mode.', async()=> {
    expect(screen.getByText(/rcapuz/i)).toBeTruthy(); 

    await waitFor(()=> {
      fireEvent.click(screen.getByTitle(/Profile Edit/i));
    });

    expect(screen.getByLabelText(/Username/i).value).toBe('rcapuz');
  });
});

describe('Update Prixer profile data correctly', ()=>{
  it('Display basic data correctly on input values', async()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Fotógrafía y Diseño"
        >
          <option value="Fotógrafía y Diseño">Fotógrafía y Diseño</option>
          <option value="Fotografía">Fotografía</option>
          <option value="Diseño">Diseño</option>
        </Select>
      </div>
    );
    expect(screen.getByText(/rcapuz/i)).toBeTruthy(); 

    await waitFor(()=> {
      fireEvent.click(screen.getByTitle(/Profile Edit/i));
    });

    expect(screen.getByLabelText(/Nombre/i).value).toBe('Ricardo');
    expect(screen.getByLabelText(/Username/i).value).toBe('rcapuz');  
    expect(getByTestId("select")).toBeTruthy();  
    expect(screen.getByLabelText(/Instagram/i).value).toBe('capuzr');
    expect(screen.getByLabelText(/Apellido/i).value).toBe('Capuz');
    expect(screen.getByLabelText(/Descripción/i).value).toBe('Fuck it and leap up.');
    
  });
  it('Update data on inputs (states) when inputting new data', async()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Fotógrafía y Diseño"
        >
          <option value="Fotógrafía y Diseño">Fotógrafía y Diseño</option>
          <option value="Fotografía">Fotografía</option>
          <option value="Diseño">Diseño</option>
        </Select>
      </div>
    );
    expect(screen.getByText(/rcapuz/i)).toBeTruthy(); 

    await waitFor(()=> {
      fireEvent.click(screen.getByTitle(/Profile Edit/i));
    });

    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const specialty = getByTestId("select");
    const username = screen.getByLabelText(/Username/i);
    const instagram = screen.getByLabelText(/Instagram/i);
    const description = screen.getByLabelText(/Descripción/i);

    await waitFor(()=> {
      fireEvent.change(firstName, {target: {value: 'Ricardo Jesús'}});
      fireEvent.change(lastName, {target: {value: 'Capuz Lárez'}});
      fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'Diseño'}});
      fireEvent.change(username, {target: {value: 'capuzr'}});
      fireEvent.change(instagram, {target: {value: 'rcapuz'}});
      fireEvent.change(description, {target: {value: 'Fuck it and leap up joe.'}});
    });

    expect(firstName.value).toBe('Ricardo Jesús');
    expect(lastName.value).toBe('Capuz Lárez');
    expect(specialty.childNodes[0].childNodes[0].value).toBe('Diseño');
    expect(username.value).toBe('capuzr');
    expect(instagram.value).toBe('rcapuz');
    expect(description.value).toBe('Fuck it and leap up joe.');
  });
  
  it('Allow to click the pen and displays updated Prixer profile data.', async()=> {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <div>
        <Select
          native={true}
          onChange={mockCallback}
          data-testid="select"
          defaultValue="Fotógrafía y Diseño"
        >
          <option value="Fotógrafía y Diseño">Fotógrafía y Diseño</option>
          <option value="Fotografía">Fotografía</option>
          <option value="Diseño">Diseño</option>
        </Select>
      </div>
    );
    expect(screen.getByText(/rcapuz/i)).toBeTruthy(); 

      axiosMock.post.mockResolvedValue({
        data: {
          username: 'caminante',
          firstName: 'Ricardo',
          lastName: 'Capuz',
          email: 'rcapuz@prixelart.com',
          specialty: 'Diseño',
          instagram: 'caminante02',
          dateOfBirth: '1991/05/12',
          description: 'Fuck it and leap up.',
          country: 'Venezuela',
          city: 'Caracas'
        }});

    await waitFor(()=> {
      fireEvent.click(screen.getByTitle(/Profile Edit/i));
    });

    const firstName = screen.getByLabelText(/Nombre/i);
    const lastName = screen.getByLabelText(/Apellido/i);
    const specialty = getByTestId("select");
    const username = screen.getByLabelText(/Username/i);
    const instagram = screen.getByLabelText(/Instagram/i);
    const description = screen.getByLabelText(/Descripción/i);

    await waitFor(()=> {
      fireEvent.change(firstName, {target: {value: 'Ricardo Jesús', textContent: 'Ricardo Jesús'}});
      fireEvent.change(lastName, {target: {value: 'Capuz Lárez', textContent: 'Capuz Lárez'}});
      fireEvent.click(specialty.childNodes[0].childNodes[0], {target: {value: 'Diseño'}});
      fireEvent.change(username, {target: {value: 'caminante'}});
      fireEvent.change(instagram, {target: {value: 'caminante02'}});
      fireEvent.change(description, {target: {value: 'Fuck it and leap up joe.'}});
    });

    await waitFor(()=> {
      fireEvent.click(screen.getByTitle(/Profile Edit/i));
    });
    
    expect(screen.getByText('caminante | ig: caminante02')).toBeTruthy();
  });
});