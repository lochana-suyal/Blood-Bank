const $ = (id) => document.getElementById(id);

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const inventoryKey = "bloodBankCentreInventory";
const profileKey = "bloodBankCentreProfile";
const requestsKey = "bloodBankCentreAssignedRequests";

function readData(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data === null ? fallback : data;
    } catch {
        return fallback;
    }
}

let inventory = readData(inventoryKey, {});
let profile = readData(profileKey, {});
let requests = readData(requestsKey, []);

if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    inventory = {};
}

if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    profile = {};
}

if (!Array.isArray(requests)) {
    requests = [];
}

const role = (
    localStorage.getItem("loggedInRole") || "hospital"
).toLowerCase();

const defaultType = role === "ngo" ? "NGO" : "Hospital";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// Show inventory input fields
function renderInventoryFields() {
    $("inventoryFields").innerHTML = bloodGroups.map(group => `
        <div class="blood-item">
            <strong>${group}</strong>
            <label for="stock-${group.replace("+", "plus").replace("-", "minus")}">
                Available Units
            </label>
            <input
                type="number"
                min="0"
                step="1"
                required
                data-group="${group}"
                id="stock-${group.replace("+", "plus").replace("-", "minus")}"
                value="${Math.max(0, Number(inventory[group]) || 0)}"
            >
        </div>
    `).join("");
}

// Show stock summary
function renderInventorySummary() {
    $("inventorySummary").innerHTML = bloodGroups.map(group => `
        <div class="blood-item">
            <strong>${group}</strong>
            <span>${Math.max(0, Number(inventory[group]) || 0)} units</span>
        </div>
    `).join("");

    const availableGroups = bloodGroups.filter(group =>
        Number(inventory[group]) > 0
    ).length;

    const totalUnits = bloodGroups.reduce((total, group) =>
        total + Math.max(0, Number(inventory[group]) || 0), 0
    );

    $("groupsListed").textContent = availableGroups;
    $("totalUnits").textContent = totalUnits;
}

// Status styling
function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "fulfilled") return "fulfilled";
    if (value === "rejected" || value === "cancelled") return "rejected";

    return "";
}

// Show requests
function renderRequests() {
    $("totalRequests").textContent = requests.length;

    $("fulfilledRequests").textContent = requests.filter(request =>
        String(request.status || "").toLowerCase() === "fulfilled"
    ).length;

    $("requestsEmpty").classList.toggle("hidden", requests.length > 0);

    $("requestsTableBody").innerHTML = requests.map((request, index) => `
        <tr>
            <td>${escapeHTML(request.id || "REQ-" + (index + 1))}</td>
            <td>${escapeHTML(request.patientName || request.patient || "N/A")}</td>
            <td>${escapeHTML(request.bloodGroup || "N/A")}</td>
            <td>${escapeHTML(request.units || request.unitsRequired || "N/A")}</td>
            <td>
                <span class="status ${getStatusClass(request.status)}">
                    ${escapeHTML(request.status || "Pending")}
                </span>
            </td>
            <td>
                <select class="status-select" data-index="${index}">
                    ${["Pending", "Accepted", "Rejected", "Fulfilled"].map(status => `
                        <option value="${status}"
                            ${String(request.status || "Pending") === status ? "selected" : ""}>
                            ${status}
                        </option>
                    `).join("")}
                </select>
            </td>
        </tr>
    `).join("");

    const recent = requests.slice(-3).reverse();

    $("recentRequests").innerHTML = recent.length
        ? recent.map(request => `
            <div class="recent-item">
                <strong>
                    ${escapeHTML(request.patientName || request.patient || "Blood Request")}
                    · ${escapeHTML(request.bloodGroup || "N/A")}
                </strong>
                <span class="status ${getStatusClass(request.status)}">
                    ${escapeHTML(request.status || "Pending")}
                </span>
            </div>
        `).join("")
        : '<p class="empty">No requests assigned yet.</p>';
}

// Display centre profile
function renderProfile() {
    $("centreType").value = profile.type || defaultType;
    $("centreName").value = profile.name || "";
    $("centrePhone").value = profile.phone || "";
    $("centreCity").value = profile.city || "";
    $("centreEmail").value =
        profile.email || localStorage.getItem("loggedInEmail") || "";

    const name = profile.name ||
        localStorage.getItem("loggedInUser") ||
        defaultType + " Account";

    $("accountName").textContent = name;
    $("welcomeTitle").textContent = name + " Dashboard";
}

// Switch dashboard sections
function showSection(sectionId) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.toggle("hidden", section.id !== sectionId);
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );
    });
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showSection(link.dataset.section);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.go);
    });
});

// Save inventory
$("inventoryForm").addEventListener("submit", event => {
    event.preventDefault();

    document.querySelectorAll("#inventoryFields input[data-group]")
        .forEach(input => {
            inventory[input.dataset.group] = Math.max(
                0,
                Math.floor(Number(input.value) || 0)
            );
        });

    localStorage.setItem(inventoryKey, JSON.stringify(inventory));

    renderInventorySummary();

    $("inventoryMessage").textContent =
        "Inventory saved successfully in this browser.";
});

// Save centre profile
$("profileForm").addEventListener("submit", event => {
    event.preventDefault();

    profile = {
        type: $("centreType").value,
        name: $("centreName").value.trim(),
        phone: $("centrePhone").value.trim(),
        city: $("centreCity").value.trim(),
        email: $("centreEmail").value.trim()
    };

    localStorage.setItem(profileKey, JSON.stringify(profile));

    renderProfile();

    $("profileMessage").textContent = "Profile saved successfully.";
});

// Update request status
$("requestsTableBody").addEventListener("change", event => {
    const select = event.target.closest("select[data-index]");

    if (!select) return;

    const index = Number(select.dataset.index);

    if (!Number.isInteger(index) || !requests[index]) return;

    requests[index].status = select.value;

    localStorage.setItem(requestsKey, JSON.stringify(requests));

    renderRequests();
});

// Logout
$("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInEmail");
    localStorage.removeItem("loggedInRole");

    window.location.href = "login.html";
});

// Initial dashboard setup
renderInventoryFields();
renderInventorySummary();
renderRequests();
renderProfile();