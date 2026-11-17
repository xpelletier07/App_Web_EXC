import { Link, useLoaderData } from 'react-router';
import { apiFetch } from '../api-url.js';

/**
 * Un questionnaire et ses questions, ce que l'animateur vérifie avant de
 * jouer. La bonne réponse est cochée : c'est la vue de l'AUTEUR.
 *
 * Rendu CÔTÉ SERVEUR, calqué sur le loader de la liste ; params.id vient
 * de l'URL (/quizzes/:id). apiFetch transmet le cookie de session.
 */
export async function loader({ request, params }) {
  const response = await apiFetch(request, `/api/quizzes/${params.id}`);
  if (!response.ok) {
    throw new Response('Questionnaire introuvable.', { status: 404 });
  }
  return response.json();
}

export default function QuizDetails() {
  const quiz = useLoaderData();

  return (
    <main className="screen">
      <h1>{quiz.title}</h1>
      <p>
        <Link to="/quizzes">← Mes questionnaires</Link>
        {' · '}
        <Link to={`/quizzes/${quiz.id}/edit`}>Modifier</Link>
      </p>
      {quiz.questions.map((question, i) => (
        <section key={question.id} className="card question">
          <h2>
            {i + 1}. {question.text}
          </h2>
          <p className="progress">{question.durationSeconds} secondes</p>
          <ul className="choice-list">
            {question.choices.map((choice) => (
              <li key={choice.id} className={choice.isCorrect ? 'correct' : ''}>
                {choice.text} {choice.isCorrect && '✓'}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
