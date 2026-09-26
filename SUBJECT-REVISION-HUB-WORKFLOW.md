# Reusable Subject Revision Hub Workflow

This workflow records the approach used for ICT600 so it can be repeated for another subject without losing source integrity, teaching alignment or student usability. Replace the subject code, chapter list and source locations; keep the quality gates.

## 1. Define the learning system before building it

Treat the project as one connected learning system with distinct outputs:

1. **Teaching notes** — complete, consistent chapter or lab notes.
2. **Assessment intelligence** — evidence about past-paper language, marks, chapter coverage and recurring question forms.
3. **Corrected answer schemes** — student-ready model answers that follow the original question order.
4. **Interactive revision** — short end-of-session activities, flashcards and later practice modes.
5. **Publication package** — a tested website and clearly versioned downloadable documents.

Do not combine their progress measures. Activity mastery, flashcard memory and full-paper practice answer different questions and must have separate trackers.

## 2. Create a source register

Record every source location and classify each file before editing anything.

| Source class | Typical contents | Role |
| --- | --- | --- |
| Official question papers | Final examinations, tests and marking information | Preserve unchanged; controls wording, order and available marks |
| Official or database answers | Supplied answer schemes or examiner material | Highest-priority answer evidence, but still check for internal errors |
| Current lecture notes | Definitions, methods, examples and terminology used in class | Primary teaching-alignment source |
| Current lab notes | Procedures, runnable code and chapter links | Primary practical source |
| Generated schemes | Draft answers produced earlier | Treat as unverified until checked question by question |
| Older editable files | Previous DOCX/TEX or archived versions | Use only when a current source is missing; never silently replace current material |

For every file, record: subject, document type, chapter/topic, semester/session, source authority, editable or fixed format, and review status.

### Source precedence

When sources disagree, use this order unless a subject requires a documented exception:

1. The original question and its stated marks.
2. Official marking instructions or verified institutional answer.
3. The current lecture/lab terminology and methods.
4. A technically valid alternative solution.
5. Generated or older material.

Preserve the original paper. Corrections belong in the answer scheme or an audit note, not in the question paper.

## 3. Audit notes for integrity and connectivity

Review every chapter or lab using the same checklist:

- The stated objectives match the actual content.
- Prerequisites are named and are available in an earlier note.
- Terms and naming remain consistent across chapters.
- Every command and code block has a purpose, expected result and relevant explanation.
- Code uses readable dark-mode colours with sufficient contrast.
- Samples run in the documented environment.
- Links, paths, images, tables and internal references resolve.
- A later lab does not require a concept that was never introduced.
- Repeated material is deliberately reinforced rather than accidentally duplicated.
- Safety and security guidance is present where students handle input, credentials, files or databases.

Maintain a chapter/lab dependency map. A simple form is:

`required earlier knowledge → current concept → next practical use → related assessment questions`

Run code checks in an isolated test environment. Record the environment, command, expected output, actual result and any accepted variation.

## 4. Standardise the notes

Use one visual and structural template for every available note, including notes that originally exist only as PDF.

Recommended order:

1. Title and learning outcomes
2. Prerequisites
3. Concept explanation
4. Worked example
5. Practical steps or code
6. Expected output
7. Common mistakes and troubleshooting
8. Security or good-practice note
9. Connection to earlier and later chapters
10. End-of-session review

If an old editable document conflicts with the current PDF, use the PDF as the content reference and recreate the editable source in the current template. Keep an audit record of deliberate corrections.

## 5. Analyse past assessments before predicting anything

Process every available semester because format, weighting and language can change.

For each question and subquestion, capture:

- session and paper type;
- part, question number and marks;
- command verb, such as define, explain, compare, design, write or evaluate;
- chapter and subtopic;
- response form: recall, explanation, diagram, calculation, trace, code or integrated scenario;
- expected answer units and likely mark granularity;
- repeated or closely related questions;
- dependencies across subparts;
- terminology and sentence patterns used by the examiners.

Calculate both **question frequency** and **mark-weighted coverage**. A chapter that appears once for 15 marks should not look less important than a chapter appearing three times for 2 marks each.

Report patterns at three levels:

1. Per semester — the exact structure used that session.
2. Across semesters — stable topics, recurring verbs and changing formats.
3. Flexible preparation — concepts and answer skills that remain useful even when the paper pattern changes.

Do not claim that a pattern guarantees a future question. Use the evidence to broaden preparation, not narrow it.

## 6. Rebuild corrected answer schemes question by question

Never accept a generated scheme as correct merely because it is complete. Verify every answer against the question, marks and teaching sources.

### Required presentation rules

- Follow the exact part, question and subquestion order of the paper.
- Put each coding answer directly under its coding question. Do not repeat code in a separate coding appendix.
- Provide complete runnable or clearly assessable code, not only an approach.
- For design, architecture, model, layout or diagram questions, include an actual model diagram with readable labels.
- Place the marks beside the answer elements that earn them.
- Make the total allocated marks equal the question total.
- Accept equivalent correct wording and alternative valid code when they meet the same requirements.
- Use bordered, visually distinct answer and marking boxes with accessible colours.
- Do not add generated-on, revised-on or similar creation dates to student schemes.
- Keep exam schemes and test schemes hidden from the student site until their controlled review is complete.

### Marking code answers

Break marks into observable units, for example:

- correct setup or declaration;
- input retrieval and validation;
- required control flow or processing;
- correct output;
- required security measure;
- syntax and integration sufficient to run.

An alternative implementation earns marks when it demonstrates the same required behaviour. Do not require an exact string match or one preferred syntax unless the question explicitly does so.

### Scheme quality gate

Before approval, confirm:

- every question has an answer;
- every requested diagram is actually drawn;
- every code response is complete and placed once;
- all mark subtotals and paper totals reconcile;
- terminology aligns with current teaching notes;
- contradictions in the source scheme have been corrected and documented;
- page order and cross-references are correct;
- the final PDF has passed a visual page-by-page review.

## 7. Build an evidence-linked master question bank

Store assessment and revision content in structured data rather than only in page markup. Each item should have a stable ID and enough metadata to trace and reuse it.

Minimum fields:

- subject and chapter;
- topic and learning objective;
- item type and difficulty;
- prompt;
- answer, model response or marking checklist;
- marks when assessment-based;
- source reference;
- verification status;
- accepted alternatives where relevant.

Keep the original evidence reference even after rewriting a question for practice. This makes later correction and expansion manageable.

## 8. Design the interactive revision layers

### End-of-lecture activities

Use a short mixed set after each chapter. Suitable formats include:

- multiple choice for misconceptions;
- multiple response for feature sets;
- fill in the blank for precise syntax or terminology;
- ordering for processes;
- short subjective responses for explanation;
- coding prompts with a model and marking checklist.

Students should answer before seeing the model. Objective items may be automatically marked. Subjective and coding items should use guided self-assessment so correct alternative wording or code is not rejected by brittle text matching.

If several review styles use the same question pool, say so explicitly. A style may change selection or order; it must not pretend to be a separate set.

### Flashcards

Start with about 20–30 cards per chapter. Do not limit the deck to definitions. Include:

- core terms;
- rememberable rules or patterns;
- code shapes and syntax;
- comparisons;
- ordered processes;
- security habits and common pitfalls.

Use colour as a consistent memory lane, for example one colour for terms and another for code. Always pair colour with a text label and symbol for accessibility.

Recommended card behaviour:

1. Show one focused prompt.
2. Require an attempt before revealing the back.
3. Give a concise answer and optional code/example.
4. Let the student choose Again, Learning or Remembered.
5. Offer a deck of cards not yet remembered.
6. Preserve chapter, filter, order and position on the device.

Flashcard ratings are confidence signals, not examination marks.

## 9. Define progress before displaying it

Every number shown to students needs a plain-language definition.

| Tracker | Meaning | Persistence |
| --- | --- | --- |
| Activity position | Current place inside one review session | Resume until completed or restarted |
| Activity mastery | Unique activities successfully completed | Shared across review styles using that activity pool |
| Review list | Activities rated incorrect, almost or review | Cleared only after successful retry or reset |
| Flashcard remembered | Latest rating is Remembered | Independent from activity mastery |
| Flashcard learning | Latest rating is Again or Learning | Independent from activity mastery |

If a student stops and returns, resume the same item order and position. A deliberate restart should be an explicit action. Do not silently replace the first card or question with an unseen one while still showing the previous session’s position.

Store progress locally by default for a privacy-friendly classroom tool. Explain that progress belongs to that browser/device and provide export/reset controls when appropriate.

## 10. Build for phones, accessibility and offline use

- Use responsive layouts and controls large enough for touch.
- Provide high-contrast dark-mode code blocks.
- Never convey status by colour alone.
- Support keyboard access and visible focus.
- Respect reduced-motion preferences.
- Keep wording concise enough for a phone screen.
- Cache the application shell and required data for offline use after the first successful visit.
- Keep question/answer assets out of public navigation until their release gate passes; remember that hiding a link is not access control if the file is still published.

## 11. Validation and release gates

Run these checks before every publication:

### Content checks

- expected chapter and item counts;
- unique stable IDs;
- no empty required fields;
- valid chapter/category/type references;
- complete source references;
- assessment marks reconcile;
- no duplicate scheme sections or orphan answers.

### Technical checks

- data and script syntax;
- automated tests for filtering, scoring, progress and restoration;
- all offline-cache files exist;
- all document and resource links resolve;
- local startup works from the supplied launcher;
- phone and desktop visual checks;
- keyboard and screen-reader-labelled control checks;
- deployment workflow completes and the live site loads the new cache version.

### Publication gates

1. **Draft** — content exists but is not student-facing.
2. **Verified** — checked against sources and marks.
3. **Visually approved** — documents/pages render correctly.
4. **Published** — linked on the student site and included in the release package.

## 12. Versioning and packaging

- Keep editable sources, generated outputs and published files in clearly separated locations.
- Increase the site data/cache version whenever required offline files change.
- Run tests before committing.
- Use a descriptive commit message and confirm the deployment result.
- Create a student package only from approved current outputs.
- Retain a checksum or manifest so a later audit can identify exactly what was distributed.
- Do not tell users to delete working material until the current package has been verified to contain every important deliverable.

## 13. Reuse checklist for another subject

1. Copy the project structure, not ICT600-specific content.
2. Replace the subject identity and chapter map.
3. Register official papers, schemes, lecture notes and practical notes.
4. Complete the integrity/dependency audit.
5. Standardise the note format.
6. Analyse all available assessments by marks, topic, verb and response type.
7. Verify or rebuild every answer scheme.
8. Create the structured activity and flashcard banks with source links.
9. Confirm tracker definitions and resume behaviour.
10. Run content, code, visual, mobile, accessibility and offline checks.
11. Publish only approved resources.
12. Record gaps and future expansions in a backlog.

## 14. Suggested expansion backlog

After the base system is reliable, useful additions include spaced-repetition scheduling, instructor-selected lecture playlists, anonymous class-level misconception summaries, printable chapter cards, timed paper simulation, answer-plan practice and import/export tools for adding verified questions without editing source code.
