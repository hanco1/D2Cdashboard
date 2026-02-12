"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClearSubmissionsControl() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleClear() {
    setError("");
    setMessage("");

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        deletedCount?: number;
      };

      if (!response.ok) {
        setError(result.error ?? "Failed to clear submissions.");
        return;
      }

      setMessage(`All data cleared. Deleted ${result.deletedCount ?? 0} submissions.`);
      setPassword("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="btn min-h-10 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        onClick={() => {
          setOpen((prev) => !prev);
          setMessage("");
          setError("");
        }}
      >
        Clear All Data
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[300px] rounded-2xl border border-rose-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-900">Danger Zone</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            This will permanently delete all submissions from dashboard and database.
          </p>

          <div className="mt-3 space-y-2">
            <input
              className="field-input h-10"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              type="password"
              className="field-input h-10"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
          {message ? <p className="mt-2 text-xs font-medium text-emerald-700">{message}</p> : null}

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary min-h-9 px-3 py-2 text-xs"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn min-h-9 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleClear}
              disabled={loading}
            >
              {loading ? "Clearing..." : "Confirm Clear"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
