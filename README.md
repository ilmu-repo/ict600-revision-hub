# ICT600 Revision Hub

A mobile-first revision app for Chapters 1–9 of ICT600. It combines quick recall, fill-in-the-blank, ordering, explanation and coding activities. Objective items are marked automatically; subjective and coding responses use a verified model answer and marking checklist.

## Student features

- Four review styles: Lecture wrap-up, Quick recall, Guided practice and Full challenge
- 54 activities across nine chapters
- Dark, high-contrast coding workspace
- Local progress and targeted retry list
- Installable on a phone and available offline after the first visit
- Shareable direct link for each chapter

## Run locally

On Windows, double-click `run-local.cmd`. The hub opens at <http://localhost:8000> and remains available while the terminal window is open.

## Publish with GitHub Pages

The included workflow tests and publishes the `site` folder whenever the `main` branch is updated.

1. Create a public GitHub repository and upload this project.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Open the **Actions** tab and wait for “Deploy ICT600 Revision Hub” to finish.

The live address will normally be `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Maintain the activities

Question content is in `site/data/questions.js`. Every activity has a unique ID, chapter, type, prompt, answer/model, explanation/checklist and source note. Keep six activities per chapter for the standard lecture wrap-up. Run `npm test` after changing scoring logic.

## Privacy

The app has no account and sends no student answers to a server. Progress is saved in that browser’s local storage and can be exported or reset from the menu.
