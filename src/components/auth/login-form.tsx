"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface LoginResponsePayload {
  ok?: boolean;
  error?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("请输入邮箱和密码");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });
      const payload = (await response.json()) as LoginResponsePayload;

      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "登录失败，请检查账号或密码");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setMessage("登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login-shell">
      <div className="login-shell__card">
        <h1>登录 AI Content Factory</h1>
        <p>登录后可访问你的监控分类、账号、选题和创作数据。</p>
        <form className="login-shell__form" onSubmit={handleSubmit}>
          <label>
            邮箱
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@aicontentfactory.local"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            密码
            <input
              type="password"
              autoComplete="current-password"
              placeholder="输入密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "登录中..." : "登录"}
          </button>
        </form>
        {message ? <p className="login-shell__message">{message}</p> : null}
        <p className="login-shell__hint">
          首次默认账号：`admin@aicontentfactory.local` / `Admin@123456`
        </p>
      </div>
    </section>
  );
}
