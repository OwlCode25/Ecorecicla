// src/pages/api/history.js
//

export const prerender = false;
import { getUserRecords } from "../../utils/database.js";

export async function GET({ url }) {
  try {
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "UserId es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const records = getUserRecords(userId);

    return new Response(
      JSON.stringify({
        records: records,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
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
