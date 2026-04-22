const memberForm = document.getElementById("memberForm");
const membersList = document.getElementById("membersList");
const formMessage = document.getElementById("formMessage");
const refreshButton = document.getElementById("refreshButton");

const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL =
  window.location.protocol === "file:" || (isLocalHost && window.location.port !== "3000")
    ? "http://localhost:3000"
    : window.location.origin;

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitial(name) {
  return String(name || "").trim().charAt(0).toUpperCase() || "M";
}

function getAvatarClass(index) {
  const palette = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-fuchsia-100 text-fuchsia-700",
    "bg-rose-100 text-rose-700"
  ];

  return palette[index % palette.length];
}

function showMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.className = isError
    ? "mt-3 text-sm text-rose-600"
    : "mt-3 text-sm text-emerald-700";
}

function renderMembers(members) {
  if (!Array.isArray(members) || members.length === 0) {
    membersList.innerHTML =
      '<p class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No hay miembros registrados aun.</p>';
    return;
  }

  membersList.innerHTML = members
    .map(
      (member, index) => `
        <article class="grid grid-cols-3 items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50">
          <div class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${getAvatarClass(index)}">${getInitial(member.nombre)}</div>
          <h3 class="min-w-0 truncate font-semibold text-slate-900">${escapeHtml(member.nombre)}</h3>
          <p class="inline-flex w-fit rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">${escapeHtml(member.rol)}</p>
        </article>
      `
    )
    .join("");
}

async function loadMembers() {
  try {
    const response = await fetch(apiUrl("/api/members"));
    if (!response.ok) {
      throw new Error("No se pudieron cargar los miembros");
    }
    const members = await response.json();
    renderMembers(members);
  } catch (error) {
    membersList.innerHTML =
      '<p class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Error al cargar miembros. Verifica que el backend este ejecutandose en http://localhost:3000.</p>';
  }
}

memberForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(memberForm);
  const payload = {
    nombre: String(formData.get("nombre") || "").trim(),
    correo: String(formData.get("correo") || "").trim(),
    rol: String(formData.get("rol") || "").trim()
  };

  if (!payload.nombre || !payload.correo || !payload.rol) {
    showMessage("Completa todos los campos.", true);
    return;
  }

  try {
    const response = await fetch(apiUrl("/api/members"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "No se pudo registrar el miembro");
    }

    showMessage("Miembro registrado correctamente.");
    memberForm.reset();
    await loadMembers();
  } catch (error) {
    showMessage(
      error.message || "Error de red al registrar miembro. Verifica el backend en http://localhost:3000.",
      true
    );
  }
});

refreshButton.addEventListener("click", loadMembers);

loadMembers();
