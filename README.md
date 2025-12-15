# Uas

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Milestone 1 — Frontend (Design & Mock)

This repository implements Milestone 1: a frontend-only mock of the University Accounting System. Key points:

- **Users**: admin, accounting, student. Authorization is enforced client-side via `AuthGuard` and role checks.
- **Storage**: Demonstrates all three client-side storage methods:
	- `localStorage`: persistent user database (`users`) and optional persisted `currentUser` when remembering login.
	- `sessionStorage`: active session (`currentUser`) used for login sessions.
	- `cookies`: small convenience cookie `lastUser` when user selects "Remember me".
	See `src/app/services/storage.service.ts` and `src/app/services/auth.service.ts`.
- **Lazy Loading**: Routes are lazy-loaded using standalone component `loadComponent` entries in `src/app/app.routes.ts`.
- **Pages (UI)**: Home/login/signup/profile/admin/accounting/student pages exist as standalone components. Signup and login write/read mock data in `localStorage`.
- **Student Fees & Payroll & Budget**: UI scaffolds exist in `src/app/pages/*` with mock operations; charts and tables can be wired to `ngx-charts` or `chart.js` in next steps.
- **Interactivity & Animations**: Basic hover/transition animations and button feedback are implemented in the page CSS. A small sound/animation layer can be added as requested.
- **Chat (bonus)**: a placeholder can be integrated; recommend adding Together.ai widget snippet into `index.html` when ready.
- **Testing**: Unit tests added for `AuthService` and `StorageService`. Run `ng test` to execute them.

### How this meets the assignment requirements

- Layout design: responsive card/grid-based layout with CSS variables (palette updated for university colors) in `src/styles.css` and component CSS files.
- Interactivity: buttons, modals and forms respond to hover/focus; tab-like UI for role pages.
- Animation/feedback: small transitions, focus ring, spinner on login/signup.
- Chat (bonus): a placeholder can be integrated; recommend adding Together.ai widget snippet into `index.html` when ready.
- Users & auth: admin/accounting/student roles; `AuthGuard` enforces access; `AuthService` contains mock login/registration logic.
- Lazy loading: implemented as requested.
- Data storage: examples of cookies/session/local are included.
- Tests: basic Jasmine tests added for the storage and auth services.

If you'd like, I can now:

- Wire in the Student Fees table with responsive columns and mock invoice creation/mark-as-paid flows.
- Add real charts to Department Budget using Chart.js and mock JSON data exports for payroll.
- Integrate a small AI chat widget on the home page as a bonus.

Tell me which of the above you'd like me to implement next and I'll proceed.
