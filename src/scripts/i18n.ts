import translations from '../i18n/translations.json';

export type Language = 'el' | 'en';

const STORAGE_KEY = 'eyp-language';

function getNestedValue(obj: unknown, path: string): any {
    return path.split('.').reduce((current: any, key) => {
        return current?.[key];
    }, obj);
}

export function getLanguage(): Language {
    if (typeof window === 'undefined') {
        return 'el';
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'en' || saved === 'el') {
        return saved;
    }

    return 'el';
}

export function setLanguage(language: Language) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, language);

    applyLanguage(language);
}

export function applyLanguage(language: Language) {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language;

    /*
     * Translate normal text
     *
     * Example:
     * <h1 data-i18n="home.heroTitle"></h1>
     */
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;

        if (!key) return;

        const translation = getNestedValue(translations, key);

        if (translation?.[language] === undefined) return;

        // If the element contains other HTML elements
        // (e.g. the ▾ inside navbar buttons),
        // replace only the direct text without removing the children.
        const textNode = Array.from(element.childNodes).find(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );

        if (textNode) {
            textNode.textContent = `\n                    ${translation[language]}\n                    `;
        } else {
            element.textContent = translation[language];
        }
    });

    /*
     * Translate HTML attributes
     *
     * Example:
     * data-i18n-attr="alt|home.heroImageAlt"
     */
    document
        .querySelectorAll<HTMLElement>('[data-i18n-attr]')
        .forEach((element) => {
            const value = element.dataset.i18nAttr;

            if (!value) return;

            const separatorIndex = value.indexOf('|');

            if (separatorIndex === -1) return;

            const attribute = value.substring(0, separatorIndex);
            const key = value.substring(separatorIndex + 1);

            const translation = getNestedValue(translations, key);

            if (translation?.[language] !== undefined) {
                element.setAttribute(
                    attribute,
                    translation[language]
                );
            }
        });

    /*
     * Update language button
     *
     * Greek page  -> English
     * English page -> Ελληνικά
     */
    document
        .querySelectorAll<HTMLElement>('[data-language-switch]')
        .forEach((element) => {
            const translation = getNestedValue(
                translations,
                'nav.switchToEnglish'
            );

            if (translation?.[language] !== undefined) {
                element.textContent = translation[language];
            }
        });
}

/*
 * Language switch
 *
 * This is handled globally here, so Navbar.astro
 * doesn't need to import getLanguage/setLanguage.
 */
function setupLanguageSwitch() {
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;

        const languageSwitch = target?.closest(
            '[data-language-switch]'
        ) as HTMLAnchorElement | null;

        if (!languageSwitch) return;

        event.preventDefault();

        const currentLanguage = getLanguage();

        const newLanguage: Language =
            currentLanguage === 'el' ? 'en' : 'el';

        setLanguage(newLanguage);
    });
}

/*
 * Initialise the language when the page loads.
 */
function initializeLanguage() {
    const language = getLanguage();

    applyLanguage(language);
    setupLanguageSwitch();
}

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initializeLanguage,
            { once: true }
        );
    } else {
        initializeLanguage();
    }
}