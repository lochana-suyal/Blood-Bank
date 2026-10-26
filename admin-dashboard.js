
const $ = id => document.getElementById(id);

const USERS_KEY = "bloodBankUsers";
const REQUESTS_KEY = "bloodBankUserRequests";
const INVENTORY_KEY = "bloodBankCentreInventory";
const ASSIGNED_KEY = "bloodBankCentreAssignedRequests";

function readData(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

let users = readData(USERS_KEY, []);
let requests = readData(REQUESTS_KEY, []);
let inventory = readData(INVENTORY_KEY, {});
let assignedRequests = readData(ASSIGNED_KEY, []);

if (!Array.isArray(users)) users = [];
if (!Array.isArray(requests)) requests = [];
if (!Array.isArray(assignedRequests)) assignedRequests = [];
if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    inventory = {};
}

function getCentres() {
    return users.filter(user => {
        const role = String(user.role || "").toLowerCase();
        return role === "hospital" || role === "ngo";
    });
}

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "fulfilled") return "fulfilled";
    if (value === "rejected" || value === "cancelled") return "rejected";

    return "";
}

function renderOverview() {
    const centres = getCentres();

    $("totalUsers").textContent = users.length;
    $("totalCentres").textContent = centres.length;
    $("totalRequests").textContent = requests.length;

    $("pendingRequests").textContent = requests.filter(request =>
        ["pending", "assigned"].includes(
            String(request.status || "Pending").toLowerCase()
        )
    ).length;

    const recent = requests.slice(-5).reverse();

    $("recentTableBody").innerHTML = recent.map((request, index) => `
        <tr>
            <td>${safe(request.id || "REQ-" + (index + 1))}</td>
            <td>${safe(request.patientName || request.patient || "N/A")}</td>
            <td>${safe(request.bloodGroup || "N/A")}</td>
            <td>${safe(request.units || request.unitsRequired || "N/A")}</td>
            <td>
                <span class="status ${getStatusClass(request.status)}">
                    ${safe(request.status || "Pending")}
                </span>
            </td>
        </tr>
    `).join("");

    $("recentEmpty").classList.toggle("hidden", recent.length > 0);
}

function renderCentres() {
    const centres = getCentres();

    $("centresTableBody").innerHTML = centres.map(centre => `
        <tr>
            <td>${safe(centre.name || "Unnamed Centre")}</td>
            <td>${safe(centre.email || "N/A")}</td>
            <td>${safe(String(centre.role || "").toUpperCase())}</td>
            <td>${safe(centre.phone || "N/A")}</td>
        </tr>
    `).join("");

    $("centresEmpty").classList.toggle("hidden", centres.length > 0);
}

function renderRequests() {
    const centres = getCentres();

    $("requestsTableBody").innerHTML = requests.map((request, index) => {
        const selectedCentre = request.assignedTo || "";

        const options = centres.map((centre, centreIndex) => {
            const value = centre.email || centre.name || `centre-${centreIndex}`;
            const label = `${centre.name || centre.email || "Centre"} (${centre.role})`;

            return `
                <option value="${safe(value)}"
                    ${selectedCentre === value ? "selected" : ""}>
                    ${safe(label)}
                </option>
            `;
        }).join("");

        return `
            <tr>
                <td>${safe(request.id || "REQ-" + (index + 1))}</td>
                <td>${safe(request.patientName || request.patient || "N/A")}</td>
                <td>${safe(request.bloodGroup || "N/A")}</td>
                <td>${safe(request.units || request.unitsRequired || "N/A")}</td>
                <td>
                    <span class="status ${getStatusClass(request.status)}">
                        ${safe(request.status || "Pending")}
                    </span>
                </td>
                <td>
                    <select data-centre-select="${index}" ${centres.length === 0 ? "disabled" : ""}>
                        <option value="">Select Centre</option>
                        ${options}
                    </select>
                </td>
                <td>
                    <button class="action-btn"
                        data-assign="${index}"
                        ${centres.length === 0 ? "disabled" : ""}>
                        Assign
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    $("requestsEmpty").classList.toggle("hidden", requests.length > 0);

    // Restore each row's current selection
    requests.forEach((request, index) => {
        const select = document.querySelector(`[data-centre-select="${index}"]`);
        if (select && request.assignedTo) {
            select.value = request.assignedTo;
        }
    });
}

function renderInventory() {
    const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    $("inventoryGrid").innerHTML = groups.map(group => `
        <div class="blood-item">
            <strong>${group}</strong>
            <span>${Math.max(0, Number(inventory[group]) || 0)} units available</span>
        </div>
    `).join("");
}

function assignRequest(index) {
    const request = requests[index];
    const select = document.querySelector(`[data-centre-select="${index}"]`);

    if (!request || !select || !select.value) {
        $("requestMessage").textContent = "Please select a hospital or NGO first.";
        return;
    }

    const centre = getCentres().find(item =>
        (item.email || item.name) === select.value
    );

    if (!centre) {
        $("requestMessage").textContent = "Selected centre was not found.";
        return;
    }

    // Remove this request from any earlier centre assignment in this browser.
    assignedRequests = assignedRequests.filter(item =>
        String(item.id) !== String(request.id)
    );

    const assigned = {
        ...request,
        assignedTo: centre.email || centre.name,
        assignedCentreName: centre.name || centre.email,
        status: "Assigned"
    };

    requests[index] = assigned;
    assignedRequests.push(assigned);

    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    localStorage.setItem(ASSIGNED_KEY, JSON.stringify(assignedRequests));

    $("requestMessage").textContent =
        `Request assigned to ${centre.name || centre.email}.`;

    renderOverview();
    renderRequests();
}

$("requestsTableBody").addEventListener("click", event => {
    const button = event.target.closest("[data-assign]");
    if (!button) return;

    assignRequest(Number(button.dataset.assign));
});

// Navigation
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const sectionId = link.dataset.section;

        document.querySelectorAll(".page-section").forEach(section => {
            section.classList.toggle("hidden", section.id !== sectionId);
        });

        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.toggle("active", item === link);
        });
    });
});

// Logout
$("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInEmail");
    localStorage.removeItem("loggedInRole");

    window.location.href = "login.html";
});

// Initial page setup
renderOverview();
renderCentres();
renderRequests();
renderInventory();
