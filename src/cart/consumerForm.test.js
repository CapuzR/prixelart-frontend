import React from "react";
// import renderer from 'react-test-renderer';
import { MemoryRouter } from "react-router-dom";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  renderHook,
  getByText,
} from "@testing-library/react";
import ConsumerForm from "./consumerForm";
import axiosMock from "axios";
jest.mock("axios");
import buyState from "./buystate.json";
const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

// it('Login renders correctly', () => {
//   const tree = renderer
//     .create(<Login />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

describe("Integration tests for Consumer Form", () => {
  const props = { buyState };
  beforeEach(() => {
    const expanded = "basic";
    render(<ConsumerForm expanded={expanded} {...buyState} />);
  });

  describe("submit with valid info", () => {
    const basicData = screen.getByText("Tus datos");
    expect(basicData).toBeInTheDocument();

    waitFor(async () => {
      fireEvent.click(basicData);
    });

    it("Inputting form consumer input states works correctly", () => {
      const b = screen.getByText(/Datos Básicos/i);
      expect(b).toBeInTheDocument();

      const element = screen.getByText("Nombre");
      expect(element).toBeInTheDocument();
      expect(screen.getByLabelText(/Apellido/i).textContent).toBe("");
      expect(screen.getByLabelText(/CIo RIF/i).textContent).toBe("");
      expect(screen.getByLabelText(/Telefono/i).textContent).toBe("");
      expect(screen.getByLabelText(/Correo/i).textContent).toBe("");
      expect(screen.getByLabelText(/Dirección/i).textContent).toBe("");

      fireEvent.change(screen.getByLabelText(/Nombre/i), {
        target: { value: "Richard" },
      });
      fireEvent.change(screen.getByLabelText(/Apellido/i), {
        target: { value: "Perez" },
      });
      fireEvent.change(screen.getByLabelText(/CI o RIF/i), {
        target: { value: "23469878" },
      });
      fireEvent.change(screen.getByLabelText(/Telefono/i), {
        target: { value: "04127532468" },
      });
      fireEvent.change(screen.getByLabelText(/Correo/i), {
        target: { value: "rcapuz@prixelart.com" },
      });
      fireEvent.change(screen.getByLabelText(/Dirección/i), {
        target: { value: "Propatria" },
      });

      expect(screen.getByLabelText(/Nombre/i).value).toBe("Richard");
      expect(screen.getByLabelText(/Apellido/i).value).toBe("Perez");
      expect(screen.getByLabelText(/CI o RIF/i).value).toBe("23469878");
      expect(screen.getByLabelText(/Telefono/i).value).toBe("04127532468");
      expect(screen.getByLabelText(/Correo/i).value).toBe(
        "rcapuz@prixelart.com"
      );
      expect(screen.getByLabelText(/Dirección/i).value).toBe("Propatria");
    });

    // it("calls api with data from form", async () => {
    //   const nameField = screen.getByText(/Nombre/i);
    //   const lastnameField = screen.getByLabelText(/Apellido/i);
    //   const documentField = screen.getByLabelText(/CI o RIF/i);
    //   const phoneField = screen.getByLabelText(/Telefono/i);
    //   const emailField = screen.getByLabelText(/Correo/i);
    //   const addressField = screen.getByLabelText(/Dirección/i);

    //   const logInButton = screen.getByText(/Siguiente/i);
    //   const axMock = axiosMock.post.mockResolvedValue({
    //     data: { success: true },
    //   });

    //   expect(nameField.value).toBe("");
    //   expect(lastnameField.value).toBe("");
    //   expect(documentField.value).toBe("");
    //   expect(phoneField.value).toBe("");
    //   expect(emailField.value).toBe("");
    //   expect(addressField.value).toBe("");

    //   await waitFor(async () => {
    //     fireEvent.change(nameField, {
    //       target: { value: "Richard", textContent: "Richard" },
    //     });
    //     fireEvent.change(lastnameField, {
    //       target: { value: "Perez", textContent: "Perez" },
    //     });
    //     fireEvent.change(documentField, {
    //       target: { value: "23469878", textContent: "23469878" },
    //     });
    //     fireEvent.change(phoneField, {
    //       target: { value: "04127532468", textContent: "04127532468" },
    //     });
    //     fireEvent.change(emailField, {
    //       target: { value: "Test@gmail.com", textContent: "Test@gmail.com" },
    //     });
    //     fireEvent.change(addressField, {
    //       target: { value: "Propatria", textContent: "Propatria" },
    //     });
    //   });

    //   await waitFor(async () => {
    //     fireEvent.click(logInButton);
    //   });

    //   expect(axMock).toHaveBeenCalled();
    // });

    //     it("redirects to app page", async () => {
    //       const pageTitle = screen.getByText(/Iniciar sesión/i);
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       const passwordField = screen.getByLabelText("Contraseña");
    //       const logInButton = screen.getByText(/Inicia sesión/i);
    //       axiosMock.post.mockResolvedValue({ data: { success: true } });

    //       expect(pageTitle.textContent).toBe("Iniciar sesión");

    //       await waitFor(async () => {
    //         fireEvent.change(emailField, {
    //           target: { value: "Test@gmail.com", textContent: "Test@gmail.com" },
    //         });
    //         fireEvent.change(passwordField, {
    //           target: { value: "Test123.*", textContent: "Test123.*" },
    //         });
    //       });

    //       await waitFor(async () => {
    //         fireEvent.click(logInButton);
    //       });

    //       expect(mockHistoryPush).toHaveBeenCalledWith({
    //         pathname: "/prixer-profile",
    //       });
    //     });
    //     it("renders snackbar with success message", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       const passwordField = screen.getByLabelText(/Contraseña/i);
    //       const logInButton = screen.getByText(/Inicia sesión/i);
    //       axiosMock.post.mockResolvedValue({ data: { success: false } });

    //       expect(emailField.textContent).toBe("");
    //       expect(passwordField.textContent).toBe("");

    //       await waitFor(async () => {
    //         fireEvent.change(emailField, {
    //           target: { value: "Test@gmail.com", textContent: "Test@gmail.com" },
    //         });
    //         fireEvent.change(passwordField, {
    //           target: { value: "Test123.*", textContent: "Test123.*" },
    //         });
    //       });

    //       await waitFor(async () => {
    //         fireEvent.click(logInButton);
    //       });

    //       expect(
    //         screen.queryByText("Inicio de sesión completado.")
    //       ).toBeInTheDocument();
    //     });
    //   });

    //   describe("submit with invalid credentials", () => {
    //     it("stays on login page", async () => {
    //       const pageTitle = screen.getByText(/Iniciar sesión/i);
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       const passwordField = screen.getByLabelText("Contraseña");
    //       const logInButton = screen.getByText(/Inicia sesión/i);

    //       expect(pageTitle.textContent).toBe("Iniciar sesión");

    //       await waitFor(async () => {
    //         fireEvent.change(emailField, { target: { value: "Test@gmail.com" } });
    //         fireEvent.change(passwordField, { target: { value: "Test123.*" } });
    //         fireEvent.submit(logInButton);
    //       });

    //       expect(pageTitle.textContent).toBe("Iniciar sesión");
    //     });
    //     it("clears password field, but not email", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       const passwordField = screen.getByLabelText(/Contraseña/i);
    //       const logInButton = screen.getByText(/Inicia sesión/i);
    //       axiosMock.post.mockResolvedValue({
    //         data: {
    //           error_info: "error_email",
    //           error_message:
    //             "No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart",
    //         },
    //       });

    //       expect(emailField.value).toBe("");
    //       expect(passwordField.textContent).toBe("");

    //       await waitFor(async () => {
    //         fireEvent.change(emailField, {
    //           target: { value: "Test@gmail.com", textContent: "Test@gmail.com" },
    //         });
    //         fireEvent.change(passwordField, {
    //           target: { value: "Test123.*", textContent: "Test123.*" },
    //         });
    //       });

    //       await waitFor(async () => {
    //         fireEvent.click(logInButton);
    //       });

    //       expect(emailField.value).toBe("Test@gmail.com");
    //       expect(passwordField.value).toBe("");
    //     });

    //     it("renders snackbar with error message", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       const passwordField = screen.getByLabelText(/Contraseña/i);
    //       const logInButton = screen.getByText(/Inicia sesión/i);
    //       axiosMock.post.mockResolvedValue({
    //         data: {
    //           error_info: "error_email",
    //           error_message:
    //             "No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart",
    //         },
    //       });

    //       expect(emailField.textContent).toBe("");
    //       expect(passwordField.textContent).toBe("");

    //       await waitFor(async () => {
    //         fireEvent.change(emailField, {
    //           target: { value: "Test@gmail.com", textContent: "Test@gmail.com" },
    //         });
    //         fireEvent.change(passwordField, {
    //           target: { value: "Test123.*", textContent: "Test123.*" },
    //         });
    //       });

    //       await waitFor(async () => {
    //         fireEvent.click(logInButton);
    //       });

    //       expect(
    //         screen.getByText(
    //           "No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart"
    //         )
    //       ).toBeTruthy();
    //     });
    //   });

    //   describe("with invalid input values", () => {
    //     it("display required errors for email and password when empty", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       const passwordField = screen.getByLabelText("Contraseña");
    //       const logInButton = screen.getByText(/Inicia sesión/i);

    //       expect(emailField.textContent).toBe("");
    //       expect(passwordField.textContent).toBe("");

    //       fireEvent.change(emailField, { target: { value: "" } });
    //       fireEvent.change(passwordField, { target: { value: "" } });
    //       fireEvent.submit(logInButton);

    //       //Más adelante sería ideal ubicar por palabras claves y no por textos completos para poder modificar detalles.
    //       expect(
    //         screen.getByText("Por favor completa todos los campos requeridos.")
    //       ).toBeTruthy();
    //     });

    //     it("display incorrect email address on invalid email: no @ nor .domain", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       expect(emailField.textContent).toBe("");
    //       fireEvent.change(emailField, {
    //         target: { value: "Test", textContent: "Test" },
    //       });
    //       expect(
    //         screen.getByText("Por favor introduce un correo electrónico válido.")
    //       ).toBeTruthy();
    //     });

    //     it("display incorrect email address on invalid email: no .domain", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       expect(emailField.textContent).toBe("");
    //       fireEvent.change(emailField, {
    //         target: { value: "Test@fkjsd", textContent: "Test@fkjsd" },
    //       });
    //       expect(
    //         screen.getByText("Por favor introduce un correo electrónico válido.")
    //       ).toBeTruthy();
    //     });

    //     it("display incorrect email address on invalid email: no @", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       expect(emailField.textContent).toBe("");
    //       fireEvent.change(emailField, {
    //         target: { value: "Test.com", textContent: "Test.com" },
    //       });
    //       expect(
    //         screen.getByText("Por favor introduce un correo electrónico válido.")
    //       ).toBeTruthy();
    //     });

    //     it("display incorrect email address on invalid email: no characters after punctuation", async () => {
    //       const emailField = screen.getByLabelText(/Correo/i);
    //       expect(emailField.textContent).toBe("");
    //       fireEvent.change(emailField, {
    //         target: { value: "Test@gmail.", textContent: "Test@gmail." },
    //       });
    //       expect(
    //         screen.getByText("Por favor introduce un correo electrónico válido.")
    //       ).toBeTruthy();
    //     });

    //     it("display incorrect password address on invalid password", async () => {
    //       const passwordField = screen.getByLabelText("Contraseña");

    //       expect(passwordField.textContent).toBe("");

    //       fireEvent.change(passwordField, { target: { value: "Test" } });

    //       //Más adelante sería ideal ubicar por palabras claves y no por textos completos para poder modificar detalles.
    //       expect(
    //         screen.getByText(
    //           "Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial."
    //         )
    //       ).toBeTruthy();
    //     });
    //   });
  });
});
