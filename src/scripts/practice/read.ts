import { escapeHtml } from '../../lib/escape-html';
import type { ReadItem } from '../../lib/practice/types';
import { el, play, say, type MountItem } from './ui';

/** Tap parts of a line to see what they do, then a short "tap the part that…" quiz. */
export const mountRead: MountItem<ReadItem> = (root, item, { sound, report }) => {
  const anatomy = el(root, '[data-read="line"]');
  const explain = el(root, '[data-read="explain"]');
  const playButton = el<HTMLButtonElement>(root, '[data-read="play"]');
  const quizQ = el(root, '[data-read="quiz-q"]');
  const quizLine = el(root, '[data-read="quiz-line"]');
  const quizFb = el(root, '[data-read="quiz-fb"]');
  const quizCount = el(root, '[data-read="quiz-count"]');
  const quizNext = el<HTMLButtonElement>(root, '[data-read="quiz-next"]');

  /** Draw the line as tappable parts, coloured by kind. */
  const renderLine = (box: HTMLElement, onPick: (i: number, b: HTMLButtonElement) => void) => {
    box.replaceChildren(
      ...item.parts.map((part, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `tok tok--${part.kind}`;
        b.textContent = part.text;
        b.dataset.i = String(i);
        b.addEventListener('click', () => onPick(i, b));
        return b;
      }),
    );
  };
  const tokens = (box: HTMLElement) => [...box.querySelectorAll<HTMLButtonElement>('.tok')];

  const explainPart = (i: number) => {
    const part = item.parts[i];
    explain.innerHTML = `<span class="explain__k">${escapeHtml(part.label)}</span><span class="explain__v">${escapeHtml(part.title)}</span><span class="explain__d">${escapeHtml(part.detail)}</span>`;
    for (const t of tokens(anatomy)) t.classList.toggle('tok--hl', Number(t.dataset.i) === i);
  };
  renderLine(anatomy, explainPart);
  explainPart(0);
  playButton.addEventListener('click', () => void play(sound, item.line, playButton, explain));

  let qi = 0;
  let score = 0;
  let answered = false;
  const count = () => {
    quizCount.textContent = `${qi + 1} / ${item.quiz.length} · ${score} right`;
  };
  const renderQuiz = () => {
    const q = item.quiz[qi];
    answered = false;
    quizQ.textContent = q.question;
    quizNext.hidden = true;
    say(quizFb, null);
    count();
    renderLine(quizLine, (i, b) => {
      if (answered) return;
      answered = true;
      const good = q.correctParts.includes(i);
      if (good) score++;
      for (const t of tokens(quizLine)) if (q.correctParts.includes(Number(t.dataset.i))) t.classList.add('tok--hl');
      if (!good) b.classList.add('tok--pick');
      say(quizFb, good ? 'good' : 'bad', (good ? 'Yes. ' : 'Not quite. ') + q.explanation);
      count();
      const last = qi === item.quiz.length - 1;
      quizNext.hidden = last;
      // The item counts as right when every question was right on the first tap.
      if (last) report(score === item.quiz.length);
    });
  };
  quizNext.addEventListener('click', () => {
    qi++;
    renderQuiz();
  });
  renderQuiz();
  return {};
};
