# Creed Frontend Repo

Welcome to the frontend repo of creed. This repo is built using Next.js, Typescript, Tailwind, Shadcn UI, Zod.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Folder Logic](#folder-logic)
- [Component Logic](#component-logic)
- [Business Logic](#business-logic)
- [Dependencies](#dependencies)

<a name="tech-stack"></a>

## Tech Stack

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Shadcn UI](https://ui.shadcn.com/)

<a name="features"></a>

## Features

- **User Authentication**: Users can sign up, log in, reset password and manage their accounts
- **Dashboard**: Users can access their dashboard and view information like Pre-Hire Onboarding Progress, Activity Panel, Forms Table, Sidebar, Header
- **Forms Page**: Users can view the forms page and see a more detailed view of their forms, status, progress and and other features like pagination, filtering, sorting.
- **Form**: Users can view and fill each form. each form also has a validator assigned to it and logic for submitiing, prefiiling the form.
- **Documents**: Users can view documents page and get access to featurs like uploading documents, viewing document status, progress and and other features like pagination, filtering, sorting.
- **Clients**: Users can view the clients page and see a table containing list of all clients. users also have access to features like filtering, sorting and pagination.
- **New Intake**: Users can create new client by filling the new intake form. the form has been integrated with validator, submission logic, progress bar and prefilling.

- **Admin**: Admin page is a protected page accesible for only admins with the right credentials. Admin has the power to view and approve users forms and documents.
  <a name="installation"></a>

## Installation

Clone the monorepo:

```bash
  git clone https://github.com/crudexec/aw.git
```

Navigate to the frontend directory:

```bash
  cd packages/frontend
```

Install dependencies:

```bash
  npm install
```

Navigate to the backend "src" directory:

```bash
  cd ../backend/src
```

Run the backend docker container (Make sure docker is installed and open on your computer):

```bash
  npm run docker:dev
```

Run the frontend app when the backend server has started:

```bash
  npm run dev
```

You can now view the app in your browser (You'll be redirected to login page if you're not logged in. but if you're logged in, you'll be redirected to your dashboard):

```bash
  http://localhost:3000
```

<a name="installation"></a>

## Usage

Once the app is running locally, you can:

- Sign up for a new account at (http://localhost:3000/signup) or log in with existing credentials at (http://localhost:3000/login)
- After logged in, you'll be redirected to your dashboard where you can check your Pre-Hire Onboarding Form Status, Activities, Forms, Sidebar, Header.
- Click on "Complete Onboarding" in the pre-hire onboarding container to go to the forms page.
- You can also access the forms page by clicking on the Onboaridng dropdown in the sidebar, the click on forms.
- In the forms page, You can view a more detailed view of your forms, status, progress and and other features like pagination, filtering, sorting.
- Click on a form in the table and you'll be redirected to that form page where you can fill the form. Validation is also implemented in all forms using zod and a custom build validation engine.
- Click on the documents link from the sidebar to be redirected to the documents page.
- In the documents page, you'll have access to uploading of documents, viewing documents status and progress, searching and sorting.
- Click on the clients link from the sidebar and you'll be reirected to the clients page where you can view the list of all clients and filter using the tabs option.
- You can also create a new client by clicking on the "New Intake" at the top right or the one at the center of the page if you haven't created any clients.
- In the new intake form page, You'll have access to create new client by filling the forms, each form has been integrated with validations and form submission.
- You can access the admin page by creating an admin profile by visiting (localhost:300/admin-signup), then you'll be redirected to the admin login (http://localhost:3000/admin-login)
- You'll be redirected to the admin page after login. In the admin page you'll be welcomed with a table containing all users firstname, lastname, status, submitted data.
- By clicking on a user, you'll be redirected to the user forms page and two new link will be added to the sidebar which is (Forms and Documents).
- In the forms page, you can view the forms, manage the forms and check the status
- In the documents page, you can view the documents, manage the documents and check the status

<br>

<a name="folder-structure"></a>

## Folder Structure

```bash
--frontend
    ├── public
    ├── src
        ├── actions
        ├── app
        ├── components
        ├── constants
        ├── hooks
        ├── lib
        ├── services
        ├── types
        ├── utils
        └── package-lock.json
    ├── .eslintrc.json
    ├── .gitignore
    ├── Dockerfile
    ├── README.md
    ├── components.json
    ├── docker.compose.yml
    ├── jest.config.ts
    ├── jest.setup.ts
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    └── tsconfig.json
```

<a name="folder-logic"></a>

## Folder Logic

This is the logic and rules to follow when creating or updating a folder.

- **Public**: `Public` folder contains assets like images. store images for a page in a seperate folder to ensure readability.
- **Src**: The `Src` folder contains all our app logic, pages, tests and components.
- **Actions**: `Actions` folder contains the logic that will be used for mutating data to an endpoint for methods like "POST, PATCH, PUT". NB: Don't put any GET requests in this folder. GET requests will be in the services folder.

  The `action` folder has an `upload.ts` file. This file is a reusable function that is used to upload files and then return the file url. don't put this file in any other location unless you change all imports.

  When you're creating an action, create a folder in the actions folder and name it the action you want to create. the create `__tests__` folder, `index.ts` file and the action you want to create file `action-name.ts`. Use Kebab-Case for naming you file and folder in the actions folder.

  The `__tests__` folder will contain the tests for the action you want to create using jest. For example `action-name.test.ts`.

  The `index.ts` file will contain all direct exports of your actions.

  The `action-name.ts` file will contain the logic for your actions.

  NB: You can create multiple action file in the folder, but you will create a test file for each action.

- **App**: `App` folder is the root of the application which contains all pages and some higher order components wrapper for some pages.

  To create a new page, make sure the page is associated with it's route groups. For example any page that is in the main dashboard should be in the `(dashboard)` folder. NB: You can create new route group for page that is not associated with any route groups.

  You create a new page by creating a folder called the page name. then create a `page.tsx` file which contains the page components.

  Some route groups have some page wrappers which are used for protecting routes, context. don't move them unless you know what you are doing and updated the imports.

- **Components**: The `components` folder contains some reusable and shared components across the app. it also have some unique folders which shouldn't be edited unless it's necessary and no other components are affected.

  The `UI` folder contains the prebuilt components gotten from Shadcn UI. This components shouldn't be edited because they are used across the app and it can affect some components UI. instead, you can create new custom component for your feature or pass props to the component and dynamically update the component UI.

  The `components` folder also have some other components that are used across the apps which should only be edited unless you know what you are doing.

  Kebab-Casing should be used for comnponents folder `my-component` while Pascal Casing should be used for component file `MyComponent.tsx`

- **Constants**: The `constants` folder contains an `index.ts` file which has all the constants used across our application.

  NB: Constant name should be all caps. `export const MY_CONSTANTS = "hello world"`

- **Hooks**: The `hooks` folder contains all our custom hooks. custom hooks must start "use". e.g: `useLocalStorage.ts`.

  NB: Only use custom hooks when you necessarily need to.

- **Lib**: The `lib` folder contains a tailwind utility function and any utility function we'll need for making api request.

  NB: Don't put any component utility function in the `lib` folder, instead in the `utils` folder.

  NB: Don't make any API requests in the `lib` folder. only put the utility function for an api request here.

- **Services**: The `services` folder all the business logic for receiving, manipulating and returning data to pages and components.

  To create a new service, create the folder of your service in the `services` folder and it should contain: `__tests__`, `index.ts` and `service-name.ts`.

  The **tests** folder will contain the tests for the service you want to create using jest. For example `service-name.test.ts.`

  The `index.ts` file will contain all direct exports of your services.

  The `service-name.ts` file will contain the logic for your service.

  NB: You can create multiple service file in the folder, but you will create a test file for each service.

- **Types**: The `types` folder contains the types that you will need in the application.

  NB: Only create a type here if the type will be used in more than one place

  NB: Use Pascal Case for type. `MyType.ts`

  NB: Use `interface` for components and `type` for utility, services and actions functions.

- **Utils**: The `utils` folder contains the utility functions that will be used in the app.

  The `utils` folder has `helpers.ts` file, `__tests__`, `schemas` folder and `validators` folder.

  The `helpers.ts` file contains all helper functions that will be used in the app.

  The `__tests__` folder contains the tests files for all functions in the root folder of the `utils` folder.

  The `schemas` folder contains the schemas for our forms using zod. It contains: `__tests__`, `index.ts` `SchemaName.ts`.

  The `__tests__` folder contains the tests files for the schemas.

  The `SchemaName.ts` contains the schema for our form using zod.

  The `index.ts` file will contain all direct exports of your schemas.

  NB: The schema name should be in pascal casing.

  The `validators` folder will contain our custom validation logic and tests. `__tests__`, `form-validator.ts` and `index.ts`.

  The `__tests__` folder contains the tests files for the validator.

  The `form-validator.ts` contains the validator for our form.

  The `index.ts` file will contain all direct exports of your schemas.

  NB: You can create more validators and schemas. The validator functions must be in kebab-casing while the schemas are in Pascal Casings.

<a name="component-logic"></a>

## Component Logic

```bash
    Documentation coming soon...
```

<a name="business-logic"></a>

## Business Logic

```bash
    Documentation coming soon...
```

<a name="dependencies"></a>

## Dependencies

The project utilizes the following main dependencies:

- **Next.js**
- **Typescript**
- **Tailwind CSS**
- **axios**
- **@tanstack/react-query**
- **Shadcn UI:** Shadcn UI makes use of radix-ui
- **react-signature-canvas**
- **react-day-picker**
- **framer-motion**
- **zod**
- **headless ui**
