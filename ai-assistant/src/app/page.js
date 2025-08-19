"use client";
import { useEffect, useMemo, useState } from "react";

/* ---------- Splash screen ---------- */
function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500); // 1.5s splash
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={styles.splash}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Welcome to AI System</h1>
      <p style={{ opacity: 0.8, animation: "pulse 1s infinite" }}>Loading…</p>
      <style jsx global>{`
        body {
          margin: 0;
          background: #000000;
          color: white;
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Helpers ---------- */
const LS_KEY = "aiChat.sessions";

function loadSessions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  } catch {}
}

function newSession() {
  const id = String(Date.now());
  return { id, title: "New chat", messages: [] };
}

/* ---------- Main Chat UI ---------- */
function ChatHome() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  // create a new chat every load, but keep history saved
  useEffect(() => {
    const stored = loadSessions();
    const s = newSession();
    setSessions([s, ...stored]); // new chat always on top
    setActiveId(s.id);
  }, []);

  // persist whenever sessions change
  useEffect(() => {
    if (sessions.length) saveSessions(sessions);
  }, [sessions]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId]
  );

  function startNewChat() {
    const s = newSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !active) return;

    const userMsg = { role: "user", text, ts: Date.now() };

    // optimistic UI
    setSessions((prev) =>
      prev.map((s) =>
        s.id === active.id
          ? {
              ...s,
              messages: [...s.messages, userMsg],
              title:
                s.messages.length === 0
                  ? text.slice(0, 25) || "New chat"
                  : s.title,
            }
          : s
      )
    );

    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setSessions((prev) =>
        prev.map((s) =>
          s.id === active.id ? { ...s, messages: [...s.messages, data] } : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  function deleteSession(id) {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeId === id) {
        if (filtered.length > 0) {
          setActiveId(filtered[0].id);
        } else {
          const s = newSession();
          filtered.push(s);
          setActiveId(s.id);
        }
      }
      return filtered;
    });
  }

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={{ margin: 0, fontSize: 16 }}>History</h2>
          <button style={styles.newBtn} onClick={startNewChat}>
            + New
          </button>
        </div>
        <div style={styles.sessionList}>
          {sessions.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #374151",
                borderRadius: 10,
                padding: "6px 8px",
                background: s.id === activeId ? "#1f2937" : "transparent",
              }}
            >
              <button
                onClick={() => setActiveId(s.id)}
                style={{
                  flex: 1,
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
                title={s.title}
              >
                {s.title}
              </button>

              {/* Three dots menu */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === s.id ? null : s.id)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "white",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ⋮
                </button>
                {menuOpen === s.id && (
                  <div style={styles.dropdown}>
                    <button
                      onClick={() => {
                        deleteSession(s.id);
                        setMenuOpen(null);
                      }}
                      style={styles.dropdownItem}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!sessions.length && <p style={{ opacity: 0.6 }}>No chats yet</p>}
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {active?.messages?.length === 0 ? (
          <div style={styles.fullCenter}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>
              What are you working on?
            </h2>
            <div style={styles.searchBar}>
              <span style={styles.searchIcon}>＋</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={styles.searchInput}
              />
             
              <button style={styles.iconBtn} onClick={sendMessage}>
                ➤
              </button>
            </div>
          </div>
        ) : (
          <>
            <header style={styles.header}>
              <h1 style={{ margin: 0, fontSize: 22 }}>Welcome to this AI Chatbot</h1>
              <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
                
              </p>
            </header>
            <div style={styles.messages}>
              {active?.messages?.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: 560,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background:
                        m.role === "user" ? "#2563eb" : "#374151",
                      color: "white",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.inputRow}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={styles.input}
              />
              <button onClick={sendMessage} style={styles.sendBtn}>
                Send
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  const [showHome, setShowHome] = useState(false);
  return showHome ? <ChatHome /> : <Splash onDone={() => setShowHome(true)} />;
}

/* ---------- Styles ---------- */
const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "linear-gradient(to bottom, #000000, #111827, #000000)",
    color: "white",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
  },
  splash: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "#000000",
    color: "white",
    textAlign: "center",
  },
  sidebar: {
    width: 280,
    borderRight: "1px solid #374151",
    padding: 12,
    background: "#0f172a", // smoother deep black
    color: "white",
    overflowY: "auto",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sessionList: { display: "flex", flexDirection: "column", gap: 6 },
  newBtn: {
    border: "1px solid #2563eb",
    color: "#2563eb",
    background: "transparent",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  header: {
    background: "#111827",
    borderBottom: "1px solid #374151",
    padding: "14px 16px",
    textAlign: "center",
  },
  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    background: "#111827",
    borderTop: "1px solid #374151",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "white",
    outline: "none",
  },
  sendBtn: {
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  fullCenter: {
    height: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "#1f2937",
    borderRadius: 9999,
    padding: "10px 14px",
    width: "100%",
    maxWidth: 600,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  searchIcon: {
    color: "#9ca3af",
    fontSize: 18,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    marginLeft: 10,
    fontSize: 18,
    color: "#9ca3af",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "100%",
    marginTop: 4,
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: 4,
    zIndex: 10,
  },
  dropdownItem: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "6px 12px",
    textAlign: "left",
    width: "100%",
  },
};
