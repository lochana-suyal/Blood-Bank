
const form = document.getElementById("bloodRequestForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const patientName = document.getElementById("patientName").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const bloodGroup = document.getElementById("bloodGroup").value;
    const units = document.getElementById("units").value;
    const city = document.getElementById("city").value.trim();
    const hospital = document.getElementById("hospital").value.trim();
    const urgency = document.getElementById("urgency").value;
    const consent = document.getElementById("consent").checked;

    if (
        !patientName || !contact || !bloodGroup ||
        !units || !city || !hospital || !urgency || !consent
    ) {
        message.textContent = "Please fill all required fields.";
        message.style.color = "#b5122b";
        return;
    }

    if (!/^[6-9][0-9]{9}$/.test(contact)) {
        message.textContent = "Please enter a valid 10-digit mobile number.";
        message.style.color = "#b5122b";
        return;
    }

    const requestId = "REQ-" + Date.now().toString().slice(-8);

    const request = {
        id: requestId,
        patientName: patientName,
        contact: contact,
        bloodGroup: bloodGroup,
        units: Number(units),
        city: city,
        hospital: hospital,
        urgency: urgency,
        status: "Pending",
        createdAt: new Date().toLocaleDateString()
    };

    // Demo only: save this request in the current browser.
    // Do not use real patient details in this prototype.
    try {
        const requests = JSON.parse(
            localStorage.getItem("bloodRequests") || "[]"
        );

        requests.push(request);

        localStorage.setItem(
            "bloodRequests",
            JSON.stringify(requests)
        );

        message.textContent =
            "Request submitted! Your Request ID is " +
            requestId +
            ". Status: Pending. Save your Request ID.";

        message.style.color = "#217346";
        form.reset();

    } catch (error) {
        message.textContent =
            "Could not save the request. Please try again.";
        message.style.color = "#b5122b";
    }
});
