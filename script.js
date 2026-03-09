let selectedSlot = "";

const slots = document.querySelectorAll(".slot");
const form = document.getElementById("appointmentForm");
const appointmentList = document.getElementById("appointmentList");
const successMessage = document.getElementById("successMessage");

let savedAppointments = JSON.parse(localStorage.getItem("appointments")) || [];

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const serviceInput = document.getElementById("service");
const dateInput = document.getElementById("date");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const serviceError = document.getElementById("serviceError");
const dateError = document.getElementById("dateError");
const slotError = document.getElementById("slotError");

/* ================= SLOT CLICK ================= */

slots.forEach(slot => {
    slot.addEventListener("click", function () {

        if (this.classList.contains("disabled")) return;

        slots.forEach(s => s.classList.remove("active"));
        this.classList.add("active");

        selectedSlot = this.innerText;
        slotError.innerText = "";
    });
});

/* ================= DISABLE SLOTS BASED ON DATE ================= */

function disableBookedSlots() {

    const selectedDate = dateInput.value;

    slots.forEach(slot => {

        slot.classList.remove("disabled");
        slot.disabled = false;

        const isBooked = savedAppointments.some(app =>
            app.date === selectedDate && app.slot === slot.innerText
        );

        if (isBooked) {
            slot.classList.add("disabled");
            slot.disabled = true;
        }
    });
}

/* ================= RENDER DASHBOARD ================= */

function renderAppointments() {

    appointmentList.innerHTML = "";

    savedAppointments.forEach((app, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${app.name} - ${app.service} - ${app.date} - ${app.slot}
        `;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", () => {
            deleteAppointment(index);
        });

        li.appendChild(deleteBtn);
        appointmentList.appendChild(li);
    });
}

/* ================= DELETE APPOINTMENT ================= */

function deleteAppointment(index) {

    savedAppointments.splice(index, 1);
    localStorage.setItem("appointments", JSON.stringify(savedAppointments));

    renderAppointments();
    disableBookedSlots();
}

/* ================= VALIDATIONS ================= */

function validateName() {

    const value = nameInput.value.trim();
    const pattern = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

    if (value === "") {
        nameError.innerText = "Full Name is required";
        nameInput.classList.add("input-error");
        return false;
    }

    if (!pattern.test(value)) {
        nameError.innerText = "Only alphabets allowed";
        nameInput.classList.add("input-error");
        return false;
    }

    // ✅ DUPLICATE NAME CHECK (Case-Insensitive)
    const nameExists = savedAppointments.some(app =>
        app.name.toLowerCase() === value.toLowerCase()
    );

    if (nameExists) {
        nameError.innerText = "This name is already registered!";
        nameInput.classList.add("input-error");
        return false;
    }

    nameError.innerText = "";
    nameInput.classList.remove("input-error");
    return true;
}

function validateEmail() {
    const value = emailInput.value.trim();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
        emailError.innerText = "Email is required";
        emailInput.classList.add("input-error");
        return false;
    }

    if (!pattern.test(value)) {
        emailError.innerText = "Enter valid email";
        emailInput.classList.add("input-error");
        return false;
    }

    emailError.innerText = "";
    emailInput.classList.remove("input-error");
    return true;
}

function validateService() {
    if (serviceInput.value === "") {
        serviceError.innerText = "Select a service";
        serviceInput.classList.add("input-error");
        return false;
    }

    serviceError.innerText = "";
    serviceInput.classList.remove("input-error");
    return true;
}

function validateDate() {
    const value = dateInput.value;

    if (value === "") {
        dateError.innerText = "Select appointment date";
        dateInput.classList.add("input-error");
        return false;
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (selectedDate < today) {
        dateError.innerText = "Past date not allowed";
        dateInput.classList.add("input-error");
        return false;
    }

    dateError.innerText = "";
    dateInput.classList.remove("input-error");

    disableBookedSlots(); // refresh slots when date changes
    return true;
}

function validateSlot() {
    if (!selectedSlot) {
        slotError.innerText = "Select a time slot";
        return false;
    }

    slotError.innerText = "";
    return true;
}

/* ================= REAL-TIME ================= */

nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
serviceInput.addEventListener("change", validateService);
dateInput.addEventListener("change", validateDate);

/* ================= SUBMIT ================= */

form.addEventListener("submit", function(e) {

    e.preventDefault();

    if (!validateName() || !validateEmail() ||
        !validateService() || !validateDate() ||
        !validateSlot()) return;

    const appointmentObject = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        service: serviceInput.value,
        date: dateInput.value,
        slot: selectedSlot
    };

    savedAppointments.push(appointmentObject);
    localStorage.setItem("appointments", JSON.stringify(savedAppointments));

    renderAppointments();
    disableBookedSlots();

    successMessage.style.display = "block";
    setTimeout(() => {
        successMessage.style.display = "none";
    }, 3000);

    form.reset();
    selectedSlot = "";
    slots.forEach(s => s.classList.remove("active"));
});

/* ================= INITIAL LOAD ================= */

renderAppointments();