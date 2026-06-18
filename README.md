# Web Technologies Final Project (Frontend)

This repository is the official Angular frontend template for the final project.
Focus on building your application features. The project already includes automated checks for structure, linting, tests, and build.

## Install dependencies

```bash
npm install
```

## Run the project locally

```bash
npm start
```

Open `http://localhost:4200/` in your browser.

## Quality checks (local)

Run all checks:

```bash
npm run quality
```

Teacher grading (score + report):

```bash
npm run grade
```

Run individual checks:

```bash
npm run validate
npm run lint
npm run test:ci
npm run build
```

What each check does:

- `validate`: ensures the minimum required project structure exists.
- `lint`: runs Angular ESLint to enforce basic code quality.
- `test:ci`: runs unit tests once in a headless browser (CI friendly).
- `build`: builds the Angular app to verify it compiles.

## Files and folders students should not edit

Do not edit:

- .github/workflows/\*\*
- scripts/\*\*
- angular.json
- package.json
- package-lock.json
- eslint.config.\*
- tsconfig\*.json

You can edit:

- src/app/features/\*\*
- src/app/shared/\*\*
- src/app/core/services/\*\*
- src/app/core/models/\*\*
- PROJECT_INFO.md
- README.md (only the project-specific sections)

## Project-specific sections to complete

- Fill in [PROJECT_INFO.md](PROJECT_INFO.md) with your group and project details.
- Add any project notes in this README below.

### Project Notes

**GameDex** — aplicação Angular para gerir um catálogo pessoal de jogos, usando a RAWG API como fonte de dados externa.

**Funcionalidades implementadas**

- Autenticação (login/registo) com validação de campos e feedback de erros vindos do backend
- Perfil de utilizador: edição de username, upload e recorte (crop) de avatar
- Favoritos: adicionar, remover e listar jogos favoritos
- Wishlist: adicionar, remover e listar jogos na wishlist
- Reviews: criar review (rating + comentário) num jogo, e listar reviews do utilizador e por jogo
- Listagem de jogos com filtros por género e plataforma
- Página de detalhe do jogo com ações para adicionar a favoritos, wishlist e publicar review

**Integração externa**

A RAWG API é consumida no `RawgService` para listagem, pesquisa, filtros e detalhe dos jogos.

**Comunicação com o backend**

Feita através de `UserDataService` e `AuthService`, com o token JWT enviado no header `Authorization` em todos os pedidos autenticados.
