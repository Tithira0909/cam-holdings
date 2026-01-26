import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import"./script-C0LdHWuA.js";import{f as C,g as h}from"./client-api-CHDw3HUJ.js";async function B(){const t=document.getElementById("blogGrid"),e=document.querySelector(".b-feed");if(!(!t||!e)){t.innerHTML='<p style="grid-column: 1/-1; text-align: center;">Loading blogs...</p>';try{const a=await C("/blogs");if(a.length===0){t.innerHTML='<p style="grid-column: 1/-1; text-align: center;">No blogs found.</p>';const n=e.querySelector(".b-featured");n&&(n.style.display="none");return}let s=a.find(n=>n.is_featured);!s&&a.length>0&&(s=a[0]);const d=a.filter(n=>n.id!==(s?s.id:-1));if(s)S(s,e);else{const n=e.querySelector(".b-featured");n&&(n.style.display="none")}t.innerHTML="",d.forEach(n=>{const i=_(n);t.appendChild(i)}),w()}catch(a){console.error("Error loading blogs:",a),t.innerHTML='<p style="grid-column: 1/-1; text-align: center;">Error loading blogs.</p>'}}}function E(t){if(!t)return"";const e=document.createElement("div");e.innerHTML=t;const a=e.textContent||e.innerText||"";return a.substring(0,100)+(a.length>100?"...":"")}function L(t){return t?new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):""}function _(t){const e=document.createElement("article");e.className="b-card";const a=(t.type||"").toLowerCase();e.dataset.tags=a,e.dataset.title=t.title,e.dataset.date=t.created_at?t.created_at.split("T")[0]:"";const s=h(t.featured_image_url||t.banner_url),d=L(t.created_at),n=E(t.content_html),i=t.type||"Blog";return e.innerHTML=`
        <a class="b-card-link" href="#">
            <div class="b-media" style="background-image:url('${s}')"></div>
            <div class="b-glass">
            <div class="b-top">
                <span class="b-tag">${i}</span>
                <span class="b-date2">${d}</span>
            </div>
            <h3 class="b-title">${t.title}</h3>
            <p class="b-snippet">${n}</p>
            <div class="b-bottom">
                <span class="b-mini">Read →</span>
            </div>
            </div>
        </a>
    `,e}function S(t,e){let a=e.querySelector(".b-featured");a||(a=document.createElement("article"),a.className="b-featured",e.insertBefore(a,e.firstChild)),a.style.display="";const s=(t.type||"").toLowerCase();a.dataset.tags=s,a.dataset.title=t.title,a.dataset.date=t.created_at?t.created_at.split("T")[0]:"";const d=h(t.featured_image_url||t.banner_url),n=L(t.created_at),i=E(t.content_html),f=t.type||"Featured";a.innerHTML=`
      <a class="b-featured-link" href="#">
        <div class="b-featured-media" style="background-image:url('${d}')"></div>
        <div class="b-featured-glass">
          <div class="b-row">
            <span class="b-pilltag">Featured</span>
            <span class="b-date">${n}</span>
          </div>
          <h2 class="b-h2">${t.title}</h2>
          <p class="b-ex">
            ${i}
          </p>
          <div class="b-meta">
            <span class="b-cat">${f}</span>
          </div>
          <div class="b-cta">Read Article →</div>
        </div>
      </a>
    `}function w(){const t=document.getElementById("blogQ"),e=document.getElementById("blogChips"),a=document.getElementById("blogSort"),s=document.getElementById("blogGrid"),d=document.getElementById("blogEmpty"),n=document.getElementById("blogReset");let i="all";function f(){return Array.from(s.querySelectorAll(".b-card"))}function u(){const r=(t.value||"").trim().toLowerCase(),l=f();let o=l.filter(c=>{const p=(c.dataset.tags||"").toLowerCase(),y=(c.dataset.title||"").toLowerCase(),b=i==="all"||p.includes(i),g=!r||y.includes(r)||p.includes(r);return b&&g});const m=a.value;o.sort((c,p)=>{const y=c.dataset.title||"",b=p.dataset.title||"",g=new Date(c.dataset.date||"2000-01-01"),v=new Date(p.dataset.date||"2000-01-01");return m==="newest"?v-g:m==="oldest"?g-v:m==="az"?y.localeCompare(b):0}),l.forEach(c=>c.style.display="none"),o.forEach(c=>{c.style.display="",s.appendChild(c)}),d&&(d.hidden=o.length!==0)}e&&e.addEventListener("click",r=>{const l=r.target.closest(".b-chip");l&&(i=l.dataset.tag,e.querySelectorAll(".b-chip").forEach(o=>o.classList.remove("active")),l.classList.add("active"),u())}),t&&t.addEventListener("input",u),a&&a.addEventListener("change",u),n&&n.addEventListener("click",()=>{t.value="",i="all",e.querySelectorAll(".b-chip").forEach(l=>l.classList.remove("active"));const r=e.querySelector('[data-tag="all"]');r&&r.classList.add("active"),a.value="featured",u()}),document.querySelectorAll("[data-jump]").forEach(r=>{r.addEventListener("click",()=>{const l=r.getAttribute("data-jump"),o=e.querySelector(`[data-tag="${l}"]`);o&&o.click()})}),u()}document.addEventListener("DOMContentLoaded",B);
