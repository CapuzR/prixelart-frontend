import { screen, render, act } from "@testing-library/react";
import CreateAdmin from "../src/admin/adminCrud/createAdmin";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import adminRoles from "./adminRoles.json";

jest.mock("axios");

describe("Probando", () => {
  test("Encontrar el Select", async () => {
    const rolesState = { data: adminRoles };
    axios.post.mockImplementation(() => Promise.resolve(rolesState));

    await act(async () => {
      // const { container } =
      render(<CreateAdmin />);
      // screen.debug();
      // expect(container).toMatchSnapshot();
    });
    // screen.debug();
    const selectElement = screen.getByTestId("area-select");
    // console.log(selectElement);
    // Verificar si el componente Select está renderizado
    // const selectElement = screen.queryByTestId('area-select');
    expect(selectElement).toBeInTheDocument(); // Verifica si el elemento está en el DOM

    // Verificar si el componente Select está visible
    // const selectElement = screen.getByTestId('area-select');
    expect(selectElement).toBeVisible(); // Verifica si el elemento está visible en el DOM
    // const menu = selectElement.querySelector('[role="listbox"]');

    // // Obtener las opciones del menú desplegable
    // const opciones = menu.querySelectorAll('[role="option"]');

    // // Iterar sobre las opciones y obtener sus textos
    // const opcionesTextos = Array.from(opciones).map(
    //   (opcion) => opcion.textContent
    // );

    // // Imprimir los textos de las opciones
    // console.log(opcionesTextos);
  });

  // test ("Encontrar el Select", as)
});
