"use client";

import { FormEvent, useState } from "react";
import { Eye, Fuel, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/store/use-demo-store";

const accounts = [
  { label: "Propriétaire", email: "proprietaire@sud.ci", scope: "Toutes les stations et tous les CRUD" },
  { label: "Gérant", email: "gerant@sud.ci", scope: "Sa station, voyages et alertes" },
  { label: "Superviseur", email: "superviseur@sud.ci", scope: "Opérations et suivi terrain" },
  { label: "Chauffeur", email: "chauffeur@sud.ci", scope: "Mission affectée uniquement" },
];

export function LoginScreen() {
  const login = useDemoStore((state) => state.login);
  const [email, setEmail] = useState("proprietaire@sud.ci");
  const [password, setPassword] = useState("ProFuel#Demo2026!");
  const [error, setError] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(!login(email, password));
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <svg viewBox="0 0 100 80" aria-hidden="true">
            <path d="M42 28C45 14 58 4 75 4H98S68 4 56 16C48 24 44 32 42 28Z" fill="#F18313" />
            <path d="M12 4H42C58 4 68 14 68 28S54 52 42 54H12C6 54 2 50 2 44V14C2 8 6 4 12 4Z" fill="#2B62AC" />
            <rect x="2" y="60" width="96" height="12" rx="3" fill="#2B62AC" />
          </svg>
          <span>SUD CONTRACTORS</span>
        </div>
        <div>
          <span className="eyebrow light">ProFuel Control</span>
          <h1>Maîtrisez vos <em>opérations,</em><br />réduisez vos pertes.</h1>
          <p>Chaque utilisateur accède uniquement aux données et actions autorisées par son rôle.</p>
        </div>
        <div className="login-trust">
          <span><ShieldCheck /> Accès sécurisé par profil</span>
          <span><Fuel /> Traçabilité de bout en bout</span>
        </div>
      </section>

      <section className="login-form-panel">
        <form onSubmit={submit} className="login-card">
          <span className="eyebrow">Connexion sécurisée</span>
          <h2>Accéder au centre de contrôle</h2>
          <p>Sélectionnez un compte de démonstration ou saisissez ses identifiants.</p>

          <div className="demo-accounts">
            {accounts.map((account) => (
              <button
                type="button"
                key={account.email}
                className={email === account.email ? "selected" : ""}
                onClick={() => { setEmail(account.email); setPassword("ProFuel#Demo2026!"); setError(false); }}
              >
                <strong>{account.label}</strong>
                <small>{account.scope}</small>
              </button>
            ))}
          </div>

          <label>
            Adresse e-mail
            <span><Mail /><input aria-label="Adresse e-mail" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></span>
          </label>
          <label>
            Mot de passe
            <span><LockKeyhole /><input aria-label="Mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></span>
          </label>
          {error && <div className="login-error">Identifiants incorrects. Utilisez le mot de passe de démonstration indiqué ci-dessous.</div>}
          <button className="login-submit" type="submit">Se connecter <Eye /></button>
          <small className="login-hint">Mot de passe commun : <strong>ProFuel#Demo2026!</strong></small>
        </form>
      </section>
    </main>
  );
}
