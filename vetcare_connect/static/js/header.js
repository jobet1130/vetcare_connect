/**
 * header.js
 * @author: Jobet P. Casquejo
 * @description: Global JS for Wagtail Vetcare Connect Header (No Theme Changer)
 * @version: 1.1
 * @date: 11-12-2025
 */
class Header {
    /**
     * Initialize the header class
     * @param {string} headerSelector - Header container selector
     * @param {string} mobileMenuSelector - Mobile menu container selector
     */
    constructor(headerSelector = '#main-header', mobileMenuSelector = '#mobile-menu'){
        this.header = $(headerSelector);
        this.mobileMenu = $(mobileMenuSelector);
        this.navLinks = $('.nav-link');
        this.mobileToggle = $('#mobile-menu-toggle');
        this.mobileClose = $('#mobile-menu-close');

        this.initStickyHeader();
        this.initMobileMenu();
        this.initAjaxNavigation();
    }

    /**
     * Sticky header on scroll
     */
    initStickyHeader() {
        $(window).on('scroll', () => {
            if($(window).scrollTop() > 50) {
                this.header.addClass('scrolled');
            } else {
                this.header.removeClass('scrolled');
            }
        });
    }

    /**
     * Mobile Menu Toggle
     */
    initMobileMenu() {
        this.mobileToggle.on('click', () => this.mobileMenu.addClass('show'));
        this.mobileClose.on('click', () => this.mobileMenu.removeClass('show'));

        // Close menu when clicking outside
        $(document).on('click', (e) => {
            if (!$(e.target).closest(this.mobileMenu).length && !$(e.target).is(this.mobileToggle)) {
                this.mobileMenu.removeClass('show');
            }
        });
    }

    /**
     * AJAX navigation via JSON API
     */
    initAjaxNavigation() {
        this.navLinks.on('click', (e) => this.handleNavClick(e));
    }

    /**
     * Handles navigation clicks
     * @param {Event} e - click event
     */
    handleNavClick(e) {
        e.preventDefault();
        const url = $(e.currentTarget).attr('href');

        $.ajax({
            url,
            type: 'GET',
            dataType: 'json',
            beforeSend: () => this.showSpinner(),
            success: (response) => this.handleJsonResponse(response),
            error: (xhr, status, error) => this.handleAjaxError(xhr, status, error),
            complete: () => this.hideSpinner(),
        });
    }

    /**
     * Show loading spinner
     */
    showSpinner() {
        const spinnerHtml = `
        <div class="spinner-border text-primary spinner-border-sm ms-2" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;
        this.header.append(spinnerHtml);
    }

    /**
     * Hide loading spinner
     */
    hideSpinner() {
        this.header.find('.spinner-border').remove();
    }

    /**
     * Handles JSON API responses
     * @param {{status: string, html?: string, message?: string}} response
     */
    handleJsonResponse(response) {
        if(response.status === 'success' && response.html){
            $('#page-content').html(response.html);
            this.mobileMenu.removeClass('show');
        } else if(response.status === 'error') {
            console.warn('API Error: ', response.message);
            alert(response.message || 'Failed to load content');
        }
    }

    /**
     * Handles AJAX Errors
     * @param {jqXHR} xhr
     * @param {string} status
     * @param {string} error
     */
    handleAjaxError(xhr, status, error) {
        console.error('AJAX Navigation Error: ', {xhr, status, error});
        alert('Navigation failed');
    }
}

// Initialize the Header
$(document).ready(() => {
    window.Header = new Header();
});
