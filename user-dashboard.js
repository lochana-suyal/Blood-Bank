const $ = (id) => document.getElementById(id);

const REQUEST_KEY = "bloodBankUserRequests";
const PROFILE_KEY = "bloodBankUserProfile";
const NOTIFICATION_KEY = "bloodBankUserNotifications";

function readData(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        return [];
    }
}

let requests = readData(REQUEST_KEY);
let notifications = readData(NOTIFICATION_KEY);

let profile;
try {
    profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
} catch {
    profile = {};
}

if (!profile.name) {
    profile.name = localStorage.getItem("loggedInUser") || "";
}

function saveData() {
    localStorage.setItem(REQUEST_KEY, JSON.stringify(requests));
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

function showProfile() {
    const name = profile.name || "User";

    $("welcomeName").textContent = name;
    $("headerName").textContent = name;
    $("avatar").textContent = name.charAt(0).toUpperCase();

    $("profileName").value = profile.name || "";
    $("profileEmail").value = profile.email || "";
}

function updateStats() {
    $("totalRequests").textContent = requests.length;

    $("progressRequests").textContent = requests.filter(
        r => ["Pending", "Assigned", "In Progress"].includes(r.status)
    ).length;

    $("fulfilledRequests").textContent = requests.filter(
        r => r.status === "Fulfilled"
    ).length;

    $("cancelledRequests").textContent = requests.filter(
        r => r.status === "Cancelled"
    ).length;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN");
}

function renderRequests() {
    const table = $("requestTableBody");
    table.replaceChildren();

    $("emptyRequests").hidden = requests.length > 0;

    [...requests].reverse().forEach(request => {
        const row = document.createElement("tr");

        [
            request.id,
            request.bloodGroup,
            request.units
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className =
            "status " + request.status.toLowerCase().replaceAll(" ", "-");
        badge.textContent = request.status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(request.date);
        row.appendChild(dateCell);

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.className = "action-btn";
        viewButton.textContent = "View";

        viewButton.onclick = () => {
            alert(
                "Request ID: " + request.id +
                "\nPatient: " + request.patientName +
                "\nBlood Group: " + request.bloodGroup +
                "\nUnits: " + request.units +
                "\nHospital: " + request.hospitalName +
                "\nCity: " + request.city +
                "\nStatus: " + request.status
            );
        };

        actionCell.appendChild(viewButton);

        if (request.status === "Pending") {
            const cancelButton = document.createElement("button");
            cancelButton.className = "action-btn";
            cancelButton.textContent = "Cancel";

            cancelButton.onclick = () => {
                if (!confirm("Do you want to cancel this request?")) return;

                request.status = "Cancelled";

                notifications.push({
                    message: "Request " + request.id + " was cancelled.",
                    date: new Date().toISOString()
                });

                saveData();
                renderAll();
            };

            actionCell.appendChild(cancelButton);
        }

        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

function renderNotifications() {
    const list = $("notificationList");
    list.replaceChildren();

    if (notifications.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No new notifications.";
        list.appendChild(message);
        return;
    }

    [...notifications].reverse().slice(0, 5).forEach(item => {
        const notification = document.createElement("div");
        notification.className = "notification-item";

        const message = document.createElement("p");
        message.textContent = item.message;

        const date = document.createElement("small");
        date.textContent = item.date ? formatDate(item.date) : "";

        notification.append(message, date);
        list.appendChild(notification);
    });
}

function renderAll() {
    showProfile();
    updateStats();
    renderRequests();
    renderNotifications();
}

$("newRequestBtn").onclick = () => {
    $("newRequestSection").hidden = false;
    $("newRequestSection").scrollIntoView({ behavior: "smooth" });
};

$("cancelFormBtn").onclick = () => {
    $("newRequestSection").hidden = true;
    $("requestForm").reset();
    $("formMessage").textContent = "";
};

$("requestForm").onsubmit = event => {
    event.preventDefault();

    const request = {
        id: "#REQ" + Date.now().toString().slice(-6),
        bloodGroup: $("bloodGroup").value,
        units: Number($("units").value),
        patientName: $("patientName").value.trim(),
        contact: $("contact").value.trim(),
        hospitalName: $("hospitalName").value.trim(),
        city: $("city").value.trim(),
        details: $("details").value.trim(),
        status: "Pending",
        date: new Date().toISOString()
    };

    requests.push(request);

    notifications.push({
        message: "Your request " + request.id + " was submitted in this demo.",
        date: new Date().toISOString()
    });

    saveData();
    renderAll();

    $("formMessage").textContent =
        "Request saved! It is pending in this demo; no hospital has been notified.";

    $("requestForm").reset();

    setTimeout(() => {
        $("newRequestSection").hidden = true;
        $("formMessage").textContent = "";
        $("requests").scrollIntoView({ behavior: "smooth" });
    }, 1800);
};

$("profileForm").onsubmit = event => {
    event.preventDefault();

    profile = {
        name: $("profileName").value.trim(),
        email: $("profileEmail").value.trim()
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem("loggedInUser", profile.name);

    $("profileMessage").textContent = "Profile saved successfully.";
    renderAll();
};

$("availabilityGroup").onchange = () => {
    const group = $("availabilityGroup").value;

    $("availabilityResult").textContent = group
        ? group + " selected. Live hospital/NGO stock is not connected yet."
        : "Live inventory is not connected yet.";
};

$("logoutBtn").onclick = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
};

document.querySelectorAll(".nav-link").forEach(link => {
    link.onclick = () => {
        document.querySelectorAll(".nav-link").forEach(item =>
            item.classList.remove("active")
        );
        link.classList.add("active");
    };
});

renderAll();