import { site } from "@/data/site";
import { DocView } from "./DocView";
import { asset } from "@/lib/asset";

const doc = (id: string) => site.docs.find((d) => d.id === id)!;

export function SimpleView() {
  const { person, projects, links } = site;
  const sections = ["about", "experience", "stack", "now", "notes", "contact"].map(doc);
  const ordered = [...projects.filter((p) => "featured" in p && p.featured), ...projects.filter((p) => !("featured" in p && p.featured))];
  return (
    <main className="simple">
      <header className="simple-head">
        <p className="simple-kicker">{person.role}</p>
        <h1 className="simple-name">{person.name}</h1>
        <p className="simple-tagline">{person.tagline}</p>
        <p className="simple-status">{person.status}</p>
        <nav aria-label="Links" className="simple-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} rel="noopener">
              {l.display}
            </a>
          ))}
          <a href={`mailto:${person.email}`}>{person.email}</a>
          <a href={asset("/resume.pdf")}>Resume (PDF)</a>
        </nav>
      </header>

      <section aria-labelledby="s-about">
        <h2 id="s-about">{doc("about").title}</h2>
        <DocView blocks={doc("about").blocks} />
      </section>

      <section aria-labelledby="projects">
        <h2 id="projects">Projects</h2>
        <ul className="simple-projects">
          {ordered.map((p) => (
            <li key={p.id} id={p.id}>
              <h3>
                {p.name}
                {p.status === "in-progress" && <span className="tag">in progress</span>}
              </h3>
              {"demo" in p && p.demo && (
                <figure className="simple-demo">
                  <video src={asset(p.demo.src)} poster={asset(p.demo.poster)} controls preload="none" playsInline />
                  {p.demo.note && <figcaption>{p.demo.note}</figcaption>}
                </figure>
              )}
              <p>{p.why}</p>
              <p>{p.detail}</p>
              {"context" in p && p.context && <p className="meta">{p.context}</p>}
              {p.stack.length > 0 && <p className="meta">{p.stack.join(" / ")}</p>}
              {"repo" in p && p.repo && (
                <p className="meta">
                  <a href={p.repo} rel="noopener">{p.repo.replace("https://", "")}</a>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {sections.slice(1).map((d) => (
        <section key={d.id} aria-labelledby={`s-${d.id}`}>
          <h2 id={`s-${d.id}`}>{d.title}</h2>
          <DocView blocks={d.blocks} />
        </section>
      ))}
    </main>
  );
}
