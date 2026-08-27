async function loadComponent(id, file) {
    const response = await fetch(file);
    document.getElementById(id).innerHTML = await response.text();
}


document.addEventListener("DOMContentLoaded", async () => {

    const level = Number(document.body.dataset.level || 0);

    const prefix = "../".repeat(level);

    await loadComponent("navbar", prefix + "components/navbar.html");
    await loadComponent("footer", prefix + "components/footer.html");


    /* =========================================================
       MOBILE NAVIGATION
    ========================================================= */

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    const overflowPanel = document.querySelector(".overflow-panel");
    const overflowNav = document.querySelector(".overflow-nav");
    const header = document.querySelector(".header");
    const navItems = document.querySelectorAll(".nav-item");

    if (!menuToggle || !nav) return;


    /* =========================================================
       HAMBURGER MENU
    ========================================================= */

    const isPhoneMenu = () => window.innerWidth <= 768;

    const resetOverflow = () => {
        nav.querySelectorAll(".is-overflowed").forEach(item => {
            item.classList.remove("is-overflowed");
        });
        nav.classList.remove("has-overflow");
        header.classList.remove("has-overflow");
        overflowNav.innerHTML = "";
        overflowPanel.classList.remove("active");
        overflowPanel.setAttribute("aria-hidden", "true");
    };

    const firstOverflowIndex = () => {
        let usedWidth = 0;

        return Array.from(nav.children).findIndex(item => {
            usedWidth += item.getBoundingClientRect().width;
            return usedWidth > nav.getBoundingClientRect().width;
        });
    };

    const updateOverflow = () => {
        resetOverflow();

        if (isPhoneMenu()) return;

        let overflowIndex = firstOverflowIndex();

        if (overflowIndex === -1) return;

        header.classList.add("has-overflow");
        nav.classList.add("has-overflow");
        overflowIndex = firstOverflowIndex();

        Array.from(nav.children).slice(overflowIndex).forEach(item => {
            item.classList.add("is-overflowed");
            overflowNav.appendChild(item.cloneNode(true));
        });

        overflowPanel.setAttribute("aria-hidden", "false");
    };

    menuToggle.addEventListener("click", () => {

        const target = isPhoneMenu() ? nav : overflowPanel;
        const isOpen = target.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", isOpen);

        const icon = menuToggle.querySelector(".hamburger-icon");

        if (isOpen) {
            icon.textContent = "×";
        } else {
            icon.textContent = "☰";

        }

    });


    /* =========================================================
       MOBILE DROPDOWNS
    ========================================================= */

    /* =========================================================
       CLOSE MENU AFTER CLICKING A LINK
    ========================================================= */

    document.querySelectorAll(".nav, .overflow-nav").forEach(menu => {
        menu.addEventListener("click", event => {
            const item = event.target.closest(".nav-item");
            const button = event.target.closest("button");
            const link = event.target.closest("a");

            if (item && button === item.firstElementChild && button.tagName === "BUTTON") {
                if (!isPhoneMenu()) return;

                document.querySelectorAll(".nav-item").forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove("active");
                });
                item.classList.toggle("active");
                return;
            }

            if (!link) return;

            if (isPhoneMenu()) {

                nav.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                const icon = menuToggle.querySelector(".hamburger-icon");

                icon.textContent = "☰";

                navItems.forEach(item => {
                    item.classList.remove("active");
                });

            } else {
                overflowPanel.classList.remove("active");
                overflowPanel.setAttribute("aria-hidden", "true");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.querySelector(".hamburger-icon").textContent = "☰";
            }

        });
    });


    /* =========================================================
       RESET MOBILE MENU WHEN RETURNING TO DESKTOP
    ========================================================= */

    window.addEventListener("resize", () => {

        nav.classList.remove("active");
        navItems.forEach(item => item.classList.remove("active"));
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.querySelector(".hamburger-icon").textContent = "☰";
        updateOverflow();
    });


    updateOverflow();
    window.addEventListener("load", updateOverflow, { once: true });

});