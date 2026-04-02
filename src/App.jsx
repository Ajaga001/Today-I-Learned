import { useEffect, useState } from "react";
import "./styles.css";
import supabase from "./supabase";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function loadFacts() {
        setIsLoading(true);

        let query = supabase.from("Fact").select("*");

        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }

        const { data: facts, error } = await query
          .order("votesinteresting", { ascending: false })
          .limit(1000);

        if (!error) {
          setFacts(facts);
        } else {
          alert("There was a problem loading the facts.");
        }

        setIsLoading(false);
      }

      loadFacts();
    },
    [currentCategory],
  );

  return (
    <>
      <Header show={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <p className="message">Loading...</p>
        ) : (
          <FactList facts={facts} setFacts={setFacts} /> // ✅ setFacts passed down
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ show, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="logo" />
        <h1>Today I learned</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {show ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textlength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && category && textlength <= 200) {
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("Fact")
        .insert([
          {
            text,
            source,
            category,
            created_at: new Date().toLocaleDateString("en-CA"),
          },
        ])
        .select();

      setIsUploading(false);

      if (!error) {
        setFacts((facts) => [newFact[0], ...facts]);
        setText("");
        setSource("");
        setCategory("");
        setShowForm(false);
      }
    } else {
      alert(
        "There was a problem creating a new fact. Please check that you entered valid information!",
      );
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>({200 - textlength})</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        {isUploading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create the first one!
      </p>
    );
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const isDisputed =
    fact.votesinteresting + fact.votesmindblowing < fact.votesfalse;
  function handleVote(columnName) {
    setFacts((facts) =>
      facts.map((f) =>
        f.id === fact.id ? { ...f, [columnName]: f[columnName] + 1 } : f,
      ),
    );

    supabase
      .from("Fact")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .then(({ error }) => {
        if (error) {
          alert("There was a problem voting. Please try again!");
          setFacts((facts) =>
            facts.map((f) =>
              f.id === fact.id ? { ...f, [columnName]: f[columnName] - 1 } : f,
            ),
          );
        }
      });
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[DISPUTED] </span> : null}
        {fact.text}{" "}
        <a href={fact.source} target="_blank" className="source">
          (source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            ?.color,
        }}
      >
        {fact.category}
      </span>

      <div className="votes">
        <button onClick={() => handleVote("votesinteresting")}>
          👍{fact.votesinteresting}
        </button>
        <button onClick={() => handleVote("votesmindblowing")}>
          🤯{fact.votesmindblowing}
        </button>
        <button onClick={() => handleVote("votesfalse")}>
          ⛔️{fact.votesfalse}
        </button>
      </div>
    </li>
  );
}

export default App;
