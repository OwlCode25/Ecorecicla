// src/pages/api/register.js
export const prerender = false;
import {
  createUser,
  findUserByEmail,
  findUserByRUT,
  validateRUT,
  validateEmail,
} from "../../utils/database.js";

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { name, email, rut } = data;

    // Validaciones
    if (!name || !email || !rut) {
      return new Response(
        JSON.stringify({ error: "Todos los campos son requeridos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!validateRUT(rut)) {
      return new Response(JSON.stringify({ error: "RUT inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar si el usuario ya existe
    if (findUserByEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Ya existe un usuario con este email" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (findUserByRUT(rut)) {
      return new Response(
        JSON.stringify({ error: "Ya existe un usuario con este RUT" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Crear usuario
    const success = createUser({ name, email, rut });

    if (success) {
      const newUser = findUserByEmail(email);
      return new Response(
        JSON.stringify({
          message: "Usuario creado exitosamente",
          user: newUser,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(JSON.stringify({ error: "Error al crear usuario" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
