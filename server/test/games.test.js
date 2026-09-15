import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";

let api;
before(async () => {
	api = await startServer();
});
after(() => api.close());

test("on ne peut rejoindre 2 fois la même partie avec le même pseudo (400)", async () => {
    // On crée d'abord un questionnaire
    const quiz = await api.request("POST", "/api/quizzes", {
        title: "Géographie",
    });
    assert.equal(quiz.status, 201);

    // On ajoute une question
    const question = await api.request(
        "POST",
        `/api/quizzes/${quiz.data.id}/questions`,
        {
            text: "Quelle est la capitale du Canada ?",
            durationSeconds: 20,
            choices: [
                { text: "Toronto", isCorrect: false },
                { text: "Vancouver", isCorrect: false },
                { text: "Ottawa", isCorrect: true },
            ],
        },
    );
    assert.equal(question.status, 201);

    // On crée une partie
    const game = await api.request("POST", "/api/games", {
        quizId: quiz.data.id,
    });
    assert.equal(game.status, 201);

    // On rejoint la partie avec un pseudo
    const player1 = await api.request(
        "POST",
        `/api/games/${game.data.code}/players`,
        {
            nickname: "Alice",
        },
    );
    assert.equal(player1.status, 201);

    // On tente de rejoindre la même partie avec le même pseudo
    const player2 = await api.request(
        "POST",
        `/api/games/${game.data.code}/players`,
        {
            nickname: "Alice",
        },
    );
    assert.equal(player2.status, 400);
    assert.equal(typeof player2.data.error, "string");
});
