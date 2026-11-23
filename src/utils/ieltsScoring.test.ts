import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rawScoreToListeningBand,
  rawScoreToReadingBand,
  calculateOverallBand,
  checkQuestionAnswer,
  countWords,
  formatTimer,
  gradeObjectiveTest,
} from './ieltsScoring';

test('rawScoreToListeningBand converts 40-question raw scores accurately', () => {
  assert.equal(rawScoreToListeningBand(40), 9.0);
  assert.equal(rawScoreToListeningBand(39), 9.0);
  assert.equal(rawScoreToListeningBand(37), 8.5);
  assert.equal(rawScoreToListeningBand(35), 8.0);
  assert.equal(rawScoreToListeningBand(30), 7.0);
  assert.equal(rawScoreToListeningBand(23), 6.0);
  assert.equal(rawScoreToListeningBand(16), 5.0);
  assert.equal(rawScoreToListeningBand(0), 0);
});

test('rawScoreToReadingBand differentiates Academic vs General Training', () => {
  assert.equal(rawScoreToReadingBand(30, 'academic'), 7.0);
  assert.equal(rawScoreToReadingBand(30, 'general'), 6.0);
  assert.equal(rawScoreToReadingBand(39, 'academic'), 9.0);
  assert.equal(rawScoreToReadingBand(39, 'general'), 8.5);
  assert.equal(rawScoreToReadingBand(40, 'general'), 9.0);
});

test('calculateOverallBand applies official IELTS 0.25 and 0.75 round-up rules', () => {
  assert.equal(calculateOverallBand([6.5, 6.5, 6.0, 6.0]), 6.5); // 6.25 -> 6.5
  assert.equal(calculateOverallBand([7.0, 7.0, 6.5, 6.5]), 7.0); // 6.75 -> 7.0
  assert.equal(calculateOverallBand([8.0, 7.5, 7.0, 7.0]), 7.5); // 7.375 -> 7.5
  assert.equal(calculateOverallBand([6.5, 6.0, 6.0, 6.0]), 6.0); // 6.125 -> 6.0
  assert.equal(calculateOverallBand([]), 0);
});

test('checkQuestionAnswer normalizes case, whitespace, and punctuation', () => {
  assert.equal(checkQuestionAnswer('  library  ', ['Library']), true);
  assert.equal(checkQuestionAnswer('True.', ['TRUE', 'T']), true);
  assert.equal(checkQuestionAnswer('not given', ['NOT GIVEN']), true);
  assert.equal(checkQuestionAnswer('false', ['TRUE']), false);
  assert.equal(checkQuestionAnswer('', ['TRUE']), false);
});

test('countWords handles spaces, newlines, and empty strings', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   \n\t  '), 0);
  assert.equal(countWords('Urban sustainability requires long-term planning.'), 5);
});

test('formatTimer renders MM:SS and H:MM:SS cleanly', () => {
  assert.equal(formatTimer(0), '00:00');
  assert.equal(formatTimer(65), '01:05');
  assert.equal(formatTimer(3661), '1:01:01');
});

test('gradeObjectiveTest calculates scores, unanswered counts, and band estimates', () => {
  const qs = Array.from({ length: 40 }, (_, i) => ({
    id: `q${i + 1}`,
    number: i + 1,
    acceptedAnswers: ['A'],
    explanation: 'Option A matches the speaker.',
  }));
  const answers: Record<string, string> = {};
  for (let i = 1; i <= 32; i++) answers[`q${i}`] = 'a';
  answers['q33'] = 'B';

  const res = gradeObjectiveTest(qs, answers, 'listening');
  assert.equal(res.score, 32);
  assert.equal(res.correctCount, 32);
  assert.equal(res.incorrectCount, 1);
  assert.equal(res.unansweredCount, 7);
  assert.equal(res.estimatedBand, 7.5);
});
