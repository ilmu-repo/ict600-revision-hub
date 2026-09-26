# ICT600 Revision Hub

A mobile-first revision app for Chapters 1–9 of ICT600. It combines quick recall, fill-in-the-blank, ordering, explanation and coding activities. Objective items are marked automatically; subjective and coding responses use a verified model answer and marking checklist.

**Live site:** <https://ilmu-repo.github.io/ict600-revision-hub/>

**Repository:** <https://github.com/ilmu-repo/ict600-revision-hub>

## Student features

- Four review styles: Lecture wrap-up, Quick recall, Guided practice and Full challenge
- 54 activities across nine chapters
- 225 colour-coded flashcards across nine chapters, with a separate distraction-free study screen
- Dark, high-contrast coding workspace
- Separate local trackers for activity mastery and flashcard memory, plus targeted retry modes
- Installable on a phone and available offline after the first visit
- Release-safe offline updates that prevent old pages from loading incompatible new scripts
- Shareable direct link for each chapter
- Past-paper library with seven final examinations and four Test 1 sessions
- Corrected student schemes withheld while their controlled review is in progress
- Complete exam-reference pack prepared for release after scheme approval

## Run locally

On Windows, double-click `run-local.cmd`. The hub opens at <http://localhost:8000> and remains available while the terminal window is open.

## Publish with GitHub Pages

The included workflow tests and publishes the `site` folder whenever the `main` branch is updated.

1. Create a public GitHub repository and upload this project.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Open the **Actions** tab and wait for “Deploy ICT600 Revision Hub” to finish.

The published address for this project is <https://ilmu-repo.github.io/ict600-revision-hub/>.

## Maintain the activities

Question content is in `site/data/questions.js`. Every activity has a unique ID, chapter, type, prompt, answer/model, explanation/checklist and source note. Keep six activities per chapter for the standard lecture wrap-up. Run `npm test` after changing scoring logic.

Flashcard content is in `site/data/flashcards.js`. The deck-selection page is `site/flashcards.html`, while `site/flashcard-study.html` deliberately shows only the active deck and essential controls. Keep the category label and colour meaningful, maintain 25 cards per chapter for the current release, and include a mix of terms, patterns, code, comparisons, processes and security habits. Flashcard ratings are deliberately separate from activity mastery.

Past-paper files are in `site/resources/exams`. The student-facing index is `site/exams.html`; keep the question and corrected scheme as a matched pair when adding a session, but do not expose scheme or pack links until the publication gate passes.

For the complete reusable method—from source auditing and scheme correction to tracking, testing and deployment—see [SUBJECT-REVISION-HUB-WORKFLOW.md](SUBJECT-REVISION-HUB-WORKFLOW.md).

## Privacy

The app has no account and sends no student answers to a server. Progress is saved in that browser’s local storage and can be exported or reset from the menu.
