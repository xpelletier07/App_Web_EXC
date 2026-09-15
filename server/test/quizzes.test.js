/**
 * Tests d'INTÉGRATION de l'espace auteur : on démarre l'API sur une base
 * temporaire et on lui parle en HTTP, comme le fait le client.
 *
 * Le premier test est fourni. Les test.todo sont le jalon 2 ; le dernier
 * (« un questionnaire sans question ») est le jalon 3 : il doit ÉCHOUER
 * avant que vous corrigiez la route POST /api/games.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";

let api;
before(async () => {
	api = await startServer();
});
after(() => api.close());

test("un titre vide est refusé (400)", async () => {
	const { status, data } = await api.request("POST", "/api/quizzes", {
		title: "   ",
	});
	assert.equal(status, 400);
	assert.equal(typeof data.error, "string");
});

test("un titre valide crée le questionnaire (201)", async () => {
	const { status, data } = await api.request("POST", "/api/quizzes", {
		title: "Capitales",
	});
	assert.equal(status, 201);
	assert.equal(data.title, "Capitales");
	assert.equal(typeof data.id, "number");
});

// ── Jalon 2 ───────────────────────────────────────────────────────────────

test("une question sans bonne réponse est refusée (400)", async () => {
	// On crée d'abord un questionnaire
	const quiz = await api.request("POST", "/api/quizzes", {
		title: "Géographie",
	});
	assert.equal(quiz.status, 201);

	const { status, data } = await api.request(
		"POST",
		`/api/quizzes/${quiz.data.id}/questions`,
		{
			text: "Quelle est la capitale du Canada ?",
			choices: [
				{ text: "Toronto", isCorrect: false },
				{ text: "Vancouver", isCorrect: false },
				{ text: "Montréal", isCorrect: false },
			],
		},
	);
	assert.equal(status, 400);
	assert.equal(typeof data.error, "string");
});

test("une question avec deux bonnes réponses est refusée (400)", async () => {
	const quiz = await api.request("POST", "/api/quizzes", {
		title: "Géographie",
	});
	assert.equal(quiz.status, 201);
	const { status, data } = await api.request(
		"POST",
		`/api/quizzes/${quiz.data.id}/questions`,
		{
			text: "Quelles villes sont au Canada ?",
			choices: [
				{ text: "Toronto", isCorrect: true },
				{ text: "Montréal", isCorrect: true },
				{ text: "Paris", isCorrect: false },
			],
		},
	);
	assert.equal(status, 400);
	assert.equal(typeof data.error, "string");
});

test("une question valide est ajoutée et apparaît dans GET /api/quizzes/:id", async () => {
	const quiz = await api.request("POST", "/api/quizzes", {
		title: "Capitales",
	});
	assert.equal(quiz.status, 201);
	const { status: questionStatus, data: questionData } = await api.request(
		"POST",
		`/api/quizzes/${quiz.data.id}/questions`,
		{
			text: "Quelle est la capitale du Canada ?",
			durationSeconds: 20,
			choices: [
				{ text: "Toronto", isCorrect: false },
				{ text: "Ottawa", isCorrect: true },
				{ text: "Vancouver", isCorrect: false },
			],
		},
	);
	assert.equal(questionStatus, 201);
	assert.equal(typeof questionData.id, "number");
	const { status, data } = await api.request(
		"GET",
		`/api/quizzes/${quiz.data.id}`,
	);
	assert.equal(status, 200);
	assert.equal(data.id, quiz.data.id);
	assert.equal(data.title, "Capitales");
	assert.equal(Array.isArray(data.questions), true);
	assert.equal(data.questions.length, 1);
	assert.equal(data.questions[0].text, "Quelle est la capitale du Canada ?");
});

// ── Jalon 3 : d'abord le test qui échoue, ensuite la correction ───────────

test("une partie sur un questionnaire sans question est refusée (400)",async () => {
  const quiz = await api.request("POST", "/api/quizzes", {
    title: "Capitales",
  });
  assert.equal(quiz.status, 201);
  const { status, data } = await api.request(
    "POST",
		"/api/games",
		{ quizId: quiz.data.id },
  );
  assert.equal(status, 400);
  assert.equal(typeof data.error, "string");
});
