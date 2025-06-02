import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");

// Leer archivo JSON
export function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

// Escribir archivo JSON
export function writeJSON(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Validar RUT chileno
export function validateRUT(rut) {
  if (!rut || typeof rut !== "string") return false;

  // Limpiar el RUT
  const cleanRUT = rut.replace(/[^0-9kK]/g, "");
  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;

  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1).toLowerCase();

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDV = 11 - (sum % 11);
  const finalDV =
    expectedDV === 11 ? "0" : expectedDV === 10 ? "k" : expectedDV.toString();

  return dv === finalDV;
}

// Formatear RUT
export function formatRUT(rut) {
  const cleanRUT = rut.replace(/[^0-9kK]/g, "");
  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);

  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
}

// Validar email
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generar ID único
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tipos de materiales reciclables
export const MATERIAL_TYPES = {
  // Materiales que generan dinero
  METAL: {
    name: "Metales (Aluminio, Fierro)",
    type: "money",
    rate: 100, // pesos por kg
    icon: "🔧",
  },
  COPPER: {
    name: "Cobre",
    type: "money",
    rate: 150,
    icon: "🔶",
  },

  // Materiales que generan puntos
  PLASTIC: {
    name: "Plástico",
    type: "points",
    rate: 5, // puntos por kg
    icon: "♻️",
  },
  PAPER: {
    name: "Papel y Cartón",
    type: "points",
    rate: 3,
    icon: "📄",
  },
  GLASS: {
    name: "Vidrio",
    type: "points",
    rate: 4,
    icon: "🥃",
  },
  ORGANIC: {
    name: "Residuos Orgánicos",
    type: "points",
    rate: 2,
    icon: "🌱",
  },
  TEXTILE: {
    name: "Ropa y Textiles",
    type: "points",
    rate: 6,
    icon: "👕",
  },
  MATTRESS: {
    name: "Colchones",
    type: "points",
    rate: 50, // puntos por unidad
    icon: "🛏️",
  },
  WOOL: {
    name: "Lana",
    type: "points",
    rate: 8,
    icon: "🐑",
  },
};

// Obtener todos los usuarios
export function getUsers() {
  const data = readJSON("users.json");
  return data ? data.users : [];
}

// Crear usuario
export function createUser(userData) {
  const users = getUsers();
  const newUser = {
    id: generateId(),
    ...userData,
    rut: formatRUT(userData.rut),
    points: 0,
    money: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  return writeJSON("users.json", { users });
}

// Buscar usuario por email
export function findUserByEmail(email) {
  const users = getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

// Buscar usuario por RUT
export function findUserByRUT(rut) {
  const users = getUsers();
  const formattedRUT = formatRUT(rut);
  return users.find((user) => user.rut === formattedRUT);
}

// Actualizar usuario
export function updateUser(userId, updates) {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) return false;

  users[userIndex] = { ...users[userIndex], ...updates };
  return writeJSON("users.json", { users });
}

// Registrar reciclaje
export function recordRecycling(userId, materialType, quantity, unit = "kg") {
  const data = readJSON("recycling-records.json");
  const records = data ? data.records : [];

  const material = MATERIAL_TYPES[materialType];
  if (!material) return false;

  let earned = 0;
  let type = material.type;

  if (unit === "unit") {
    earned = material.rate * quantity;
  } else {
    earned = Math.floor(material.rate * quantity);
  }

  const record = {
    id: generateId(),
    userId,
    materialType,
    quantity,
    unit,
    earned,
    type,
    date: new Date().toISOString(),
  };

  records.push(record);
  writeJSON("recycling-records.json", { records });

  // Actualizar usuario
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
    if (type === "money") {
      users[userIndex].money = (users[userIndex].money || 0) + earned;
    } else {
      const currentPoints = users[userIndex].points || 0;
      users[userIndex].points = Math.min(currentPoints + earned, 1000); // Límite de 1000 puntos
    }
    writeJSON("users.json", { users });
  }

  return record;
}

// Obtener records de reciclaje de un usuario
export function getUserRecords(userId) {
  const data = readJSON("recycling-records.json");
  const records = data ? data.records : [];
  return records.filter((record) => record.userId === userId);
}

// Obtener recompensas
export function getRewards() {
  const data = readJSON("rewards.json");
  return data ? data.rewards : [];
}

// Canjear recompensa
export function redeemReward(userId, rewardId) {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) return false;

  const rewards = getRewards();
  const reward = rewards.find((r) => r.id === rewardId);

  if (!reward) return false;

  const user = users[userIndex];
  if (user.points < reward.points) return false;

  // Descontar puntos
  users[userIndex].points -= reward.points;
  writeJSON("users.json", { users });

  return true;
}
