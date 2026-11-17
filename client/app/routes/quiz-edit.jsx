import { Form, Link, data, useActionData, useLoaderData } from 'react-router';
import { apiFetch } from '../api-url.js';

/**
 * L'éditeur de questionnaire : ajouter des questions, en retirer. Créer et
 * modifier un questionnaire sans toucher à SQL, c'est la semaine 3.
 *
 * Deux exports pour React Router : le loader (lire le questionnaire, comme
 * quiz-details.jsx) et l'action (recevoir les formulaires de la page). Les
 * deux passent par apiFetch : le cookie de session suit, et la semaine 6
 * l'API s'en servira pour vérifier que l'éditeur est bien l'auteur.
 */
export async function loader({ request, params }) {
  const response = await apiFetch(request, `/api/quizzes/${params.id}`);
  if (!response.ok) {
    throw new Response('Questionnaire introuvable.', { status: 404 });
  }
  return response.json();
}

/**
 * Une seule action pour la page, deux formulaires : le champ caché
 * « intent » dit lequel a été envoyé.
 */
export async function action({ request, params }) {
  const formData = await request.formData();

  if (formData.get('intent') === 'delete') {
    return deleteQuestion(request, params.id, formData.get('questionId'));
  }
  return addQuestion(request, params.id, formData);
}

async function addQuestion(request, quizId, formData) {
  // Les quatre champs de choix ; les vides ne sont pas envoyés.
  const choices = [1, 2, 3, 4]
    .map((n) => ({
      text: formData.get(`choice${n}`) ?? '',
      isCorrect: formData.get('correct') === String(n),
    }))
    .filter((c) => c.text.trim() !== '');

  const response = await apiFetch(request, `/api/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      text: formData.get('text'),
      durationSeconds: Number(formData.get('durationSeconds')),
      choices,
    }),
  });
  const body = await response.json();

  if (!response.ok) {
    return data({ error: body.error }, { status: response.status });
  }
  // Pas de redirection : React Router rejoue le loader, la question apparaît.
  return { added: true };
}

async function deleteQuestion(request, quizId, questionId) {
  const response = await apiFetch(request, `/api/quizzes/${quizId}/questions/${questionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.json();
    return data({ error: body.error }, { status: response.status });
  }
  return { deleted: true };
}

export default function QuizEdit() {
  const quiz = useLoaderData();
  const actionData = useActionData();

  return (
    <main className="screen">
      <h1>{quiz.title}</h1>
      <p>
        <Link to="/quizzes">← Mes questionnaires</Link>
        {' · '}
        <Link to={`/quizzes/${quiz.id}`}>Voir le questionnaire</Link>
      </p>

      {actionData?.error && <p className="error">{actionData.error}</p>}

      {quiz.questions.map((question, i) => (
        <section key={question.id} className="card question row">
          <div>
            <h2>
              {i + 1}. {question.text}
            </h2>
            <p className="progress">
              {question.durationSeconds} secondes · {question.choices.length} choix
            </p>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="questionId" value={question.id} />
            <button className="secondary">Retirer</button>
          </Form>
        </section>
      ))}

      {/* key : quand le nombre de questions change, React remonte le
          formulaire, donc le vide. Une nouvelle question, un formulaire neuf. */}
      <Form method="post" className="card" key={quiz.questions.length}>
        <h2>Nouvelle question</h2>
        <input type="hidden" name="intent" value="add" />
        <label>
          Question
          <input name="text" placeholder="Texte de la question" required />
        </label>
        <label>
          Durée (secondes)
          <input name="durationSeconds" type="number" min="5" max="60" defaultValue="20" required />
        </label>
        <fieldset className="choices-edit">
          <legend>Choix de réponse (cochez la bonne)</legend>
          {[1, 2, 3, 4].map((n) => (
            <label key={n} className="choice-edit">
              <input type="radio" name="correct" value={n} />
              <input name={`choice${n}`} placeholder={`Choix ${n}`} required={n <= 2} />
            </label>
          ))}
        </fieldset>
        <button>Ajouter la question</button>
      </Form>
    </main>
  );
}
