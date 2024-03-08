## Installation

### Pre-requisites

1. Install [NodeJS](https://nodejs.org/)
1. Install [PNPM](https://pnpm.io/installation)
1. Install [MongoDB Community Server](https://www.mongodb.com/docs/manual/administration/install-community/)

### Clone the repo

```sh
git clone https://github.com/HutchinsonJohn/d2rolltracker-backend.git
```

### Get your Bungie.net API key

1. Go to [Bungie's Dev Portal](https://www.bungie.net/en/Application) (must be signed in)
1. Click `Create New App`
1. Enter anything under Application Name and Website
1. For OAuth Client Type, select `Confidential`
1. Set Redirect URL to `https://localhost:3000/OAuth`
1. For Scope, select `Read your Destiny 2 information (Vault, Inventory, and Vendors), as well as Destiny 1 Vault and Inventory data. `
1. For Origin Header, enter `*`
1. Agree to the Terms of Use and Create New App

### Setup .env

1. Make a copy of `.env.example` and name it `.env`
1. Using the keys from your bungie.net application, enter your `X_API_KEY`, `OAUTH_ID`, and `OAUTH_SECRET` in .env

### Start Dev Server

1. Run pnpm install
1. Run the [MongoDB server](https://www.mongodb.com/docs/manual/administration/install-community/)
1. Run pnpm dev
