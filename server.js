const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5500;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json());
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use("/src", express.static(path.join(__dirname, "src")));

const members = [];
let nextId = 1;

function validateMemberInput(payload) {
  const nombre = String(payload?.nombre || "").trim();
  const correo = String(payload?.correo || "").trim();
  const rol = String(payload?.rol || "").trim();

  if (!nombre || !correo || !rol) {
    return { ok: false, message: "nombre, correo y rol son obligatorios" };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(correo)) {
    return { ok: false, message: "correo invalido" };
  }

  return { ok: true, value: { nombre, correo, rol } };
}

app.get("/api/members", (req, res) => {
  res.json(members);
});

app.post("/api/members", (req, res) => {
  const validation = validateMemberInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const member = {
    id: nextId,
    nombre: validation.value.nombre,
    correo: validation.value.correo,
    rol: validation.value.rol,
    creadoEn: new Date().toISOString()
  };

  nextId += 1;
  members.push(member);
  return res.status(201).json(member);
});

app.put("/api/members/:id", (req, res) => {
  const memberId = Number(req.params.id);
  const memberIndex = members.findIndex((member) => member.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ message: "miembro no encontrado" });
  }

  const validation = validateMemberInput(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  members[memberIndex] = {
    ...members[memberIndex],
    nombre: validation.value.nombre,
    correo: validation.value.correo,
    rol: validation.value.rol,
    actualizadoEn: new Date().toISOString()
  };

  return res.json(members[memberIndex]);
});

app.delete("/api/members/:id", (req, res) => {
  const memberId = Number(req.params.id);
  const memberIndex = members.findIndex((member) => member.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ message: "miembro no encontrado" });
  }

  members.splice(memberIndex, 1);
  return res.status(204).send();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`POLARIS ejecutandose en http://localhost:${PORT}`);
});
