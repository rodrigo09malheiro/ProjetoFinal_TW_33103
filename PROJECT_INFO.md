# Project Information

## Group Members

- Student 1: Rodrigo Fernandes Malheiro

## Project Theme

GameDex — personal video game catalog and tracking application

## External API Used

- API name: RAWG Video Games Database API
- API link: https://rawg.io/apidocs
- Requires API key? Yes

## Backend Repository

- Link: https://github.com/rodrigo09malheiro/webtech-final-project-backend-template.git

## Main Features

1. User authentication (register/login) with JWT and password encryption
2. Game catalog browsing, search and filtering by genre/platform via the RAWG API
3. Favorites and Wishlist management (add/remove/list games)
4. Reviews with star ratings and user profile management (username + avatar upload/crop)

## Pages

- Home: Games List page (catalog/browse view, landing page after login)
- List: Games List page (browse/search/filter games)
- Detail: Game Detail page (full info, add to favorites/wishlist, post review)
- Form/Create/Edit: Profile page (edit username/avatar) and review form within the Game Detail page

## Data Stored in the Backend

- users (authentication and profile data)
- favourites
- wishlist
- reviews

## Notes

Frontend built with Angular (standalone components), consuming a custom Node.js/Express + SQLite backend and the RAWG external API for game data.