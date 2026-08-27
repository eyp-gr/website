const REPO = "eyp-gr/website";
const BRANCH = "main";

const DEFAULT_BLOG_PATH = "content/blog";


function getBlogPath() {
    const section = new URLSearchParams(window.location.search).get("section");

    return section || document.body.dataset.blogPath || DEFAULT_BLOG_PATH;
}


function parseFrontmatter(raw) {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
        return {
            data: {},
            body: raw
        };
    }

    const [, frontmatter, body] = match;
    const data = {};

    frontmatter.split("\n").forEach(line => {
        const idx = line.indexOf(":");

        if (idx === -1) return;

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        value = value.replace(/^["']|["']$/g, "");

        data[key] = value;
    });

    return {
        data,
        body
    };
}


async function fetchPostList() {
    const blogPath = getBlogPath();

    const url =
        `https://api.github.com/repos/${REPO}/contents/${blogPath}?ref=${BRANCH}`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to list posts: ${res.status}`);
    }

    const files = await res.json();

    return files.filter(file => file.name.endsWith(".md"));
}


async function fetchPost(filename) {
    const blogPath = getBlogPath();

    const url =
        `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${blogPath}/${filename}`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to fetch post: ${res.status}`);
    }

    const raw = await res.text();

    return parseFrontmatter(raw);
}


async function renderPostList(containerEl) {
    try {
        const files = await fetchPostList();

        const posts = await Promise.all(
            files.map(async file => {
                const { data } = await fetchPost(file.name);

                return {
                    ...data,
                    slug: file.name.replace(/\.md$/, "")
                };
            })
        );

        posts.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        containerEl.innerHTML = posts.map(post => `
            <article class="post-card">

                ${post.image
                    ? `<img src="${post.image}" alt="">`
                    : ""
                }

                <h2>
                    <a href="post.html?slug=${encodeURIComponent(post.slug)}&section=${encodeURIComponent(getBlogPath())}">
                        ${post.title || "Untitled"}
                    </a>
                </h2>

                <p class="post-date">
                    ${post.date
                        ? new Date(post.date).toLocaleDateString()
                        : ""
                    }
                </p>

                <p class="post-summary">
                    ${post.summary || ""}
                </p>

            </article>
        `).join("");

    } catch (error) {
        console.error(error);

        containerEl.innerHTML = `
            <p>
                Δεν ήταν δυνατή η φόρτωση των άρθρων.
            </p>
        `;
    }
}


async function renderSinglePost(containerEl) {
    try {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("slug");

        if (!slug) {
            containerEl.innerHTML = `
                <p>
                    Δεν έχει οριστεί άρθρο.
                </p>
            `;

            return;
        }

        const { data, body } = await fetchPost(`${slug}.md`);

        containerEl.innerHTML = `
            <h1>${data.title || "Untitled"}</h1>

            <p class="post-meta">
                ${data.author || ""}
                ${data.author && data.date ? " — " : ""}
                ${data.date
                    ? new Date(data.date).toLocaleDateString()
                    : ""
                }
            </p>

            ${data.image
                ? `<img src="${data.image}" alt="">`
                : ""
            }

            <div class="post-body">
                ${marked.parse(body)}
            </div>
        `;

    } catch (error) {
        console.error(error);

        containerEl.innerHTML = `
            <p>
                Δεν ήταν δυνατή η φόρτωση του άρθρου.
            </p>
        `;
    }
}