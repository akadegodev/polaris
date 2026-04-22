const memberForm = document.getElementById("memberForm");
const membersList = document.getElementById("membersList");
const formMessage = document.getElementById("formMessage");
const refreshButton = document.getElementById("refreshButton");
const editModal = document.getElementById("editModal");
const editMemberForm = document.getElementById("editMemberForm");
const editFormMessage = document.getElementById("editFormMessage");
const closeEditModalButton = document.getElementById("closeEditModalButton");
const cancelEditModalButton = document.getElementById("cancelEditModalButton");
const deleteModal = document.getElementById("deleteModal");
const deleteModalText = document.getElementById("deleteModalText");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");

const API_PORT = 5500;
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL =
  window.location.protocol === "file:" || (isLocalHost && window.location.port !== String(API_PORT))
    ? `http://localhost:${API_PORT}`
    : window.location.origin;

let currentMembers = [];
let editingMemberId = null;
let deletingMemberId = null;

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

function showEditModal(member) {
  editingMemberId = member.id;
  editMemberForm.nombre.value = member.nombre;
  editMemberForm.correo.value = member.correo;
  editMemberForm.rol.value = member.rol;
  editFormMessage.textContent = "";
  editFormMessage.className = "text-sm";
  editModal.classList.remove("hidden");
  editModal.classList.add("flex");
  editMemberForm.nombre.focus();
}

function hideEditModal() {
  editingMemberId = null;
  editMemberForm.reset();
  editFormMessage.textContent = "";
  editFormMessage.className = "text-sm";
  editModal.classList.add("hidden");
  editModal.classList.remove("flex");
}

function showEditFormMessage(text, isError = false) {
  editFormMessage.textContent = text;
  editFormMessage.className = isError
    ? "text-sm text-rose-600"
    : "text-sm text-emerald-700";
}

function showDeleteModal(member) {
  deletingMemberId = member.id;
  deleteModalText.textContent = `Seguro que deseas eliminar a ${member.nombre}?`;
  deleteModal.classList.remove("hidden");
  deleteModal.classList.add("flex");
}

function hideDeleteModal() {
  deletingMemberId = null;
  deleteModal.classList.add("hidden");
  deleteModal.classList.remove("flex");
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
        <article class="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 px-3 py-3 transition hover:bg-slate-50 sm:grid-cols-12 sm:items-center">
          <div class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${getAvatarClass(index)}">${getInitial(member.nombre)}</div>
          <h3 class="min-w-0 truncate font-semibold text-slate-900 sm:col-span-5">${escapeHtml(member.nombre)}</h3>
          <p class="inline-flex w-fit whitespace-nowrap rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700 sm:col-span-2">${escapeHtml(member.rol)}</p>
          <div class="flex flex-wrap gap-2 sm:col-span-4 sm:justify-end">
            <button type="button" data-action="edit" data-id="${member.id}" class="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 whitespace-nowrap">Editar</button>
            <button type="button" data-action="delete" data-id="${member.id}" class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 whitespace-nowrap">Eliminar</button>
          </div>
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
    currentMembers = members;
    renderMembers(members);
  } catch (error) {
    membersList.innerHTML =
      `<p class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Error al cargar miembros. Verifica que el backend este ejecutandose en http://localhost:${API_PORT}.</p>`;
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
      error.message || `Error de red al registrar miembro. Verifica el backend en http://localhost:${API_PORT}.`,
      true
    );
  }
});

membersList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.dataset.action;
  const memberId = Number(target.dataset.id);

  if (!action || !memberId) {
    return;
  }

  if (action === "edit") {
    const memberToEdit = currentMembers.find((member) => member.id === memberId);
    if (!memberToEdit) {
      showMessage("Miembro no encontrado.", true);
      return;
    }
    showEditModal(memberToEdit);
    return;
  }

  if (action === "delete") {
    const memberToDelete = currentMembers.find((member) => member.id === memberId);
    if (!memberToDelete) {
      showMessage("Miembro no encontrado.", true);
      return;
    }
    showDeleteModal(memberToDelete);
  }
});

editMemberForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!editingMemberId) {
    showEditFormMessage("No hay miembro seleccionado para editar.", true);
    return;
  }

  const formData = new FormData(editMemberForm);
  const payload = {
    nombre: String(formData.get("nombre") || "").trim(),
    correo: String(formData.get("correo") || "").trim(),
    rol: String(formData.get("rol") || "").trim()
  };

  if (!payload.nombre || !payload.correo || !payload.rol) {
    showEditFormMessage("Completa todos los campos.", true);
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/members/${editingMemberId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "No se pudo actualizar el miembro");
    }

    hideEditModal();
    showMessage("Miembro actualizado correctamente.");
    await loadMembers();
  } catch (error) {
    showEditFormMessage(error.message || "Error al actualizar miembro.", true);
  }
});

confirmDeleteButton.addEventListener("click", async () => {
  if (!deletingMemberId) {
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/members/${deletingMemberId}`), {
      method: "DELETE"
    });

    if (!response.ok) {
      let errorMessage = "No se pudo eliminar el miembro";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = "No se pudo eliminar el miembro";
      }
      throw new Error(errorMessage);
    }

    hideDeleteModal();
    showMessage("Miembro eliminado correctamente.");
    await loadMembers();
  } catch (error) {
    showMessage(error.message || "Error al eliminar miembro.", true);
  }
});

refreshButton.addEventListener("click", loadMembers);

closeEditModalButton.addEventListener("click", hideEditModal);
cancelEditModalButton.addEventListener("click", hideEditModal);
cancelDeleteButton.addEventListener("click", hideDeleteModal);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    hideEditModal();
  }
});

deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    hideDeleteModal();
  }
});

loadMembers();
