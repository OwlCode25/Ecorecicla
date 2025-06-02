export const prerender = false;

import { redeemReward, getUsers } from "../../utils/database.js";

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { userId, rewardId } = data;

    if (!userId || !rewardId) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const success = redeemReward(userId, parseInt(rewardId));

    if (success) {
      return new Response(
        JSON.stringify({
          message: "Recompensa canjeada exitosamente",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(
        JSON.stringify({ error: "No se pudo canjear la recompensa" }),
        {
          status: 400,
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
