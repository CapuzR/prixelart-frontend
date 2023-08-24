import React from "react";
import axios from "axios";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateAdmin from "./createAdmin";
import adminRoles from "./adminRoles.json";

// jest.mock("axios");

test("Se llenan correctamente los campos y se acciona el botón Crear", () => {
  //   const roles = adminRoles;
  //   axios.post.mockResolvedValueOnce({ data: roles });
  //   axios.post.mockResolvedValueOnce(() => Promise.resolve({ data: roles }));
  render(<CreateAdmin />);

  const usernameInput = screen.getByRole("textbox", {
    name: /nombre de usuario/i,
  });
  fireEvent.change(usernameInput, { target: { value: "john.doe" } });

  //   const areaSelect = screen.getByLabelText("Área");
  //   fireEvent.mouseDown(areaSelect);
  //   const option = screen.getByText("Ventas");
  //   fireEvent.click(option);

  const nombreInput = screen.getByRole("textbox", {
    name: /firstname/i,
  });
  fireEvent.change(nombreInput, { target: { value: "John" } });

  const apellidoInput = screen.getByRole("textbox", {
    name: /Apellido/i,
  });
  fireEvent.change(apellidoInput, { target: { value: "Doe" } });

  const correoInput = screen.getByRole("textbox", {
    name: /Correo electrónico/i,
  });
  fireEvent.change(correoInput, { target: { value: "john.doe@example.com" } });

  const telefonoInput = screen.getByRole("textbox", {
    name: /Teléfono/i,
  });
  fireEvent.change(telefonoInput, { target: { value: "1234567890" } });

  //   const passwordInput = screen.getByRole("password", { name: /Contraseña/i });
  //   fireEvent.change(passwordInput, { target: { value: "password123" } });

  // Accionar el botón "Crear"
  const crearButton = screen.getByText("Crear");
  fireEvent.click(crearButton);

  // Realizar las aserciones correspondientes
  expect(usernameInput.value).toBe("john.doe");
  //   expect(areaInput.value).toBe("Ventas");
  expect(nombreInput.value).toBe("John");
  expect(apellidoInput.value).toBe("Doe");
  expect(correoInput.value).toBe("john.doe@example.com");
  expect(telefonoInput.value).toBe("1234567890");
  //   expect(passwordInput.value).toBe("password123");
  // ...
});
