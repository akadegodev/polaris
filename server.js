const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use("/src", express.static(path.join(__dirname, "src")));

const members = [];

app.get("/api/members", (req, res) => {
  res.json(members);
});

app.post("/api/members", (req, res) => {
  const nombre = String(req.body?.nombre || "").trim();
  const correo = String(req.body?.correo || "").trim();
  const rol = String(req.body?.rol || "").trim();

  if (!nombre || !correo || !rol) {
    return res.status(400).json({ message: "nombre, correo y rol son obligatorios" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(correo)) {
    return res.status(400).json({ message: "correo invalido" });
  }

  const member = {
    id: members.length + 1,
    nombre,
    correo,
    rol,
    creadoEn: new Date().toISOString()
  };

  members.push(member);
  return res.status(201).json(member);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`POLARIS ejecutandose en http://localhost:${PORT}`);
});
