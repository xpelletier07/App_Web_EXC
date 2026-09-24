import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import { apiFetch } from '../app/api-url.js';
import './styles.css';

/**
 * Le loader de la racine tourne pour TOUTES les pages : qui est connecté ?
 * L'API répond 401 si personne ; la barre de navigation s'adapte.
 */
export async function loader({ request }) {
  const response = await apiFetch(request, '/api/me');
  return { account: response.ok ? await response.json() : null };
}

/**
 * L'enveloppe de toutes les pages : le document HTML et la barre de
 * navigation. <Outlet /> est remplacé par la page de la route courante.
 */
export function Layout({ children }) {
  // Les données du loader de la racine, lisibles depuis n'importe où.
  const account = useRouteLoaderData('root')?.account;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Quiz M9</title>
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="topnav">
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/catalogue">Catalogue</NavLink>
          {account ? (
            <>
              <NavLink to="/quizzes">Mes questionnaires</NavLink>
              <span className="account">
                {account.avatarUrl && <img src={account.avatarUrl} alt="" />}
                {account.login}
              </span>
              <Form method="post" action="/logout">
                <button className="link">Se déconnecter</button>
              </Form>
            </>
          ) : (
            // Un lien ordinaire, pas un <Link> : on quitte l'application
            // pour aller chez GitHub, et on en reviendra par une redirection.
            <a href="/api/auth/github">Se connecter avec GitHub</a>
          )}
        </nav>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  return (
    <main className="screen">
      <h1>Oups.</h1>
      <p className="error">{error?.statusText ?? error?.message ?? 'Erreur inconnue.'}</p>
    </main>
  );
}
