export const prerender = false;

import { recordRecycling, updateUser } from "../../utils/database.js";

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { userId, materialType, quantity, unit } = data;

    if (!userId || !materialType || !quantity) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "La cantidad debe ser mayor a 0" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const record = recordRecycling(
      userId,
      materialType,
      parseFloat(quantity),
      unit,
    );

    if (record) {
      return new Response(
        JSON.stringify({
          message: "Reciclaje registrado exitosamente",
          record: record,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Error al registrar reciclaje" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
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
