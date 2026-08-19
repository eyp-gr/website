const REPO = "eyp-gr/website";
const BRANCH = "main";
const BLOG_PATH = "content/blog";

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
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
  return { data, body };
}

async function fetchPostList() {
  const url = `https://api.github.com/repos/${REPO}/contents/${BLOG_PATH}?ref=${BRANCH}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to list posts: ${res.status}`);
  const files = await res.json();
  return files.filter(f => f.name.endsWith(".md"));
}

async function fetchPost(filename) {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${BLOG_PATH}/${filename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  const raw = await res.text();
  return parseFrontmatter(raw);
}

async function renderPostList(containerEl) {
  const files = await fetchPostList();
  const posts = await Promise.all(
    files.map(async f => {
      const { data } = await fetchPost(f.name);
      return { ...data, slug: f.name.replace(/\.md$/, "") };
    })
  );
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  containerEl.innerHTML = posts.map(post => `
    <article class="post-card">
      ${post.image ? `<img src="${post.image}" alt="">` : ""}
      <h2><a href="post.html?slug=${encodeURIComponent(post.slug)}">${post.title || "Untitled"}</a></h2>
      <p class="post-date">${post.date ? new Date(post.date).toLocaleDateString() : ""}</p>
      <p class="post-summary">${post.summary || ""}</p>
    </article>
  `).join("");
}

async function renderSinglePost(containerEl) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) {
    containerEl.innerHTML = "<p>No post specified.</p>";
    return;
  }
  const { data, body } = await fetchPost(`${slug}.md`);
  containerEl.innerHTML = `
    <h1>${data.title || "Untitled"}</h1>
    <p class="post-meta">${data.author || ""} — ${data.date ? new Date(data.date).toLocaleDateString() : ""}</p>
    ${data.image ? `<img src="${data.image}" alt="">` : ""}
    <div class="post-body">${marked.parse(body)}</div>
  `;
}