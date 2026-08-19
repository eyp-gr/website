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
    const navItems = document.querySelectorAll(".nav-item");

    if (!menuToggle || !nav) return;


    /* =========================================================
       HAMBURGER MENU
    ========================================================= */

    menuToggle.addEventListener("click", () => {

        const isOpen = nav.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", isOpen);

        const icon = menuToggle.querySelector(".hamburger-icon");

        if (isOpen) {
            icon.textContent = "×";
        } else {
            icon.textContent = "☰";

            // navItems.forEach(item => {
            //     item.classList.remove("active");
            // });
        }

    });


    /* =========================================================
       MOBILE DROPDOWNS
    ========================================================= */

    navItems.forEach(item => {

        const button = item.querySelector(":scope > button");

        if (!button) return;

        button.addEventListener("click", () => {

            /* Desktop uses the normal hover dropdown */
            if (window.innerWidth > 768) return;

            /* Close all other dropdowns */
            navItems.forEach(otherItem => {

                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                }

            });

            /* Toggle this dropdown */
            item.classList.toggle("active");

        });

    });


    /* =========================================================
       CLOSE MENU AFTER CLICKING A LINK
    ========================================================= */

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 768) {

                nav.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                const icon = menuToggle.querySelector("i");

                icon.textContent = "☰";

                navItems.forEach(item => {
                    item.classList.remove("active");
                });

            }

        });

    });


    /* =========================================================
       RESET MOBILE MENU WHEN RETURNING TO DESKTOP
    ========================================================= */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            nav.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");

            const icon = menuToggle.querySelector("i");

            icon.textContent = "☰";

            navItems.forEach(item => {
                item.classList.remove("active");
            });

        }

    });

});