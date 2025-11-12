/**
 * vetcare_connect.js
 * @author: Jobet P. Casquejo
 * @description: Advanced global Javascript for the Veterinary Clinic Website (Full simulation with cookies/localStorage)
 * @dependencies: jQuery, Bootstrap 5
 * @features: Form handling, dynamic search, dark mode, spinners, alerts, toasts, smooth scroll, services grid, appointments table, cookies
 * @version: 2.0
 * @date: 11-12-2025
 */
class VetClinic {
  constructor() {
    this.initDarkMode();
    this.bindAjaxButtons('.ajax-btn');
    this.initForms();
    this.initSearch('#search-input', '#search-results', '/api/search/');
    this.initSmoothScroll();
    this.initNavbarCollapse();
    this.initServicesGrid();
    this.initAppointmentsTable();
  }

  /** -----------------------------
   * Cookie Utilities
   * ----------------------------- */
  setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }

  deleteCookie(name) {
    this.setCookie(name, '', -1);
  }

  /** -----------------------------
   * Utility Methods
   * ----------------------------- */
  showSpinner(containerSelector) {
    const spinnerHtml = `
      <div class="text-center my-3 ajax-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>`;
    $(containerSelector).append(spinnerHtml);
  }

  hideSpinner() {
    $('.ajax-spinner').remove();
  }

  showAlert(containerSelector, message, type = 'success') {
    const alertHtml = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    $(containerSelector).html(alertHtml);
  }

  showToast(message, type = 'info', delay = 3000) {
    const toastId = `toast-${Date.now()}`;
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>`;
    $('#toast-container').append(toastHtml);
    const toast = new bootstrap.Toast(document.getElementById(toastId), { delay });
    toast.show();
  }

  debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** -----------------------------
   * Dark Mode
   * ----------------------------- */
  initDarkMode() {
    const body = $('body');
    body.css('transition', 'background-color 0.3s, color 0.3s');

    const darkModeCookie = this.getCookie('darkMode');
    if (darkModeCookie === 'true') body.addClass('dark');
    else if (localStorage.getItem('darkMode') === 'true') body.addClass('dark');

    $('#dark-mode-toggle').on('click', () => {
      body.toggleClass('dark');
      const isDark = body.hasClass('dark');
      this.setCookie('darkMode', isDark, 30);
      localStorage.setItem('darkMode', isDark);
      this.showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'info');
    });
  }

  /** -----------------------------
   * Smooth Scroll
   * ----------------------------- */
  initSmoothScroll() {
    $('a[href^="#"]').on('click', function(e) {
      e.preventDefault();
      const target = $($(this).attr('href'));
      if (target.length) $('html, body').animate({ scrollTop: target.offset().top }, 500);
    });
  }

  /** -----------------------------
   * Navbar Collapse
   * ----------------------------- */
  initNavbarCollapse() {
    $('.navbar-toggler').on('click', function() {
      $('#navbarSupportedContent').toggleClass('show');
    });
  }

  /** -----------------------------
   * Form Handling
   * ----------------------------- */
  initForms() {
    this.handleFormSubmit('#appointment-form', '#form-message');
    this.restoreFormData('#appointment-form');
  }

  handleFormSubmit(formSelector, messageContainer) {
    $(formSelector).on('submit', (e) => {
      e.preventDefault();

      $(`${formSelector} .is-invalid`).removeClass('is-invalid');
      $(`${formSelector} .invalid-feedback`).remove();

      const formData = {};
      $(formSelector).serializeArray().forEach(f => (formData[f.name] = f.value));

      // Save to storage
      let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
      appointments.push(formData);
      localStorage.setItem('appointments', JSON.stringify(appointments));
      this.setCookie('appointments', JSON.stringify(appointments), 7);

      this.showAlert(messageContainer, 'Appointment booked successfully!', 'success');
      this.showToast('Appointment saved locally!', 'success');

      $(formSelector)[0].reset();
      this.restoreAppointmentsTable();
    });
  }

  restoreFormData(formSelector) {
    let savedData = localStorage.getItem('lastFormData') || this.getCookie('lastFormData');
    if (savedData) {
      const data = JSON.parse(savedData);
      for (let key in data) {
        $(`${formSelector} [name="${key}"]`).val(data[key]);
      }
    }
  }

  /** -----------------------------
   * Search
   * ----------------------------- */
  initSearch(inputSelector, resultsContainer, endpoint) {
    let timer;
    $(inputSelector).on('input', () => {
        clearTimeout(timer);
        const query = $(inputSelector).val();

        timer = setTimeout(() => {
        if (!query) return $(resultsContainer).empty();

        // Use endpoint for storing last search
        localStorage.setItem(endpoint + '_lastSearch', query);
        this.setCookie(endpoint + '_lastSearch', query, 7);

        // Simulate search over local data
        const services = JSON.parse(localStorage.getItem('/api/services/')) || [];
        const filtered = services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

        const html = filtered.map(s => `<div class="list-group-item">${s.name}</div>`).join('');
        $(resultsContainer).html(html);
        }, 300);
    });
  }

  /** -----------------------------
   * Global Buttons
   * ----------------------------- */
  bindAjaxButtons(buttonSelector) {
    $(buttonSelector).on('click', e => {
      e.preventDefault();
      const target = $(e.currentTarget).data('target');
      $(target).html('<div class="alert alert-info">Button clicked (simulated)</div>');
    });
  }

  /** -----------------------------
   * Services Simulation
   * ----------------------------- */
  getServices() {
    const defaultServices = [
      { name: 'Vaccination', description: 'Keep your pets healthy', icon: 'fas fa-syringe' },
      { name: 'Dental Cleaning', description: 'Clean and healthy teeth', icon: 'fas fa-tooth' },
      { name: 'Surgery Consultation', description: 'Expert surgical advice', icon: 'fas fa-stethoscope' },
      { name: 'Pet Grooming', description: 'Make your pets shine', icon: 'fas fa-cut' },
    ];
    return JSON.parse(localStorage.getItem('services')) || defaultServices;
  }

  initServicesGrid() {
    const services = this.getServices();
    const html = services.map(s => `
      <div class="col-md-4 mb-3">
        <div class="card h-100 text-center">
          <div class="card-body">
            <i class="${s.icon} fa-2x mb-2"></i>
            <h5 class="card-title">${s.name}</h5>
            <p class="card-text">${s.description}</p>
          </div>
        </div>
      </div>`).join('');
    $('#services-container').html(html);
    localStorage.setItem('services', JSON.stringify(services));
  }

  /** -----------------------------
   * Appointments Table Simulation
   * ----------------------------- */
  initAppointmentsTable() {
    if ($('#appointments-table').length === 0) return;
    this.restoreAppointmentsTable();
  }

  restoreAppointmentsTable() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const html = appointments.map((a, idx) => `
      <tr>
        <th scope="row">${idx + 1}</th>
        <td>${a.name || ''}</td>
        <td>${a.email || ''}</td>
        <td>${a.pet || ''}</td>
        <td>${a.service || ''}</td>
        <td>${a.date || ''}</td>
      </tr>`).join('');
    $('#appointments-table tbody').html(html);
  }
}

// Initialize the VetClinic global class
$(document).ready(() => {
  if ($('#toast-container').length === 0) $('body').append('<div id="toast-container" class="position-fixed top-0 end-0 p-3"></div>');
  window.vetClinic = new VetClinic();
});
