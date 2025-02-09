# Notion to Medium Integration 📝

> ⚠️ **DEVELOPMENT IN PROGRESS** - Please ignore the project until it's ready

## 🎯 About the Project

This project aims to automate integrations between Notion and third-party platforms, starting with Medium. Built with Node for simplicity and ease of contribution. Check my architecture docs for deeper understanding.

### Why Notion?

Notion is a powerful tool for managing content. databases pages and blocks you can build all kind of information,

Problems i want to solve:

- I want to publish my articles on Medium automatically
- I want to post on social media automatically
- I want to have a single place to manage my content
- I want to analyze my content with AI and improve it
- I'm forseeing for future, brading, values, quality versatibility of the AI content will depend on how good the information is, not database, not tables, but nodes of information. if data is ready next AI agent will be able to work for you.

### Why Medium?

Medium is one of the most popular blogging platforms. If you're using Notion as your primary content manager, wouldn't it be great to automatically export your articles as soon as they're ready?

### 🤔 Background

After exploring automation tools like Zapier, Make, n8n, and Pipedream, I found their solutions either too complex or barely customizable. This led me to create this open-source solution. If you find it useful, please leave a star! ⭐

### 🔄 How Does the Automation Work?

While Notion doesn't provide native webhooks or event triggers (yet), we implement a reliable polling mechanism to check for new content periodically. Notion has recently introduced database automation features, which suggests future improvements in their event architecture.

## 🚀 Getting Started

### Prerequisites

- Optional understand developing and API https://developers.notion.com/docs/getting-started
- 🔑 Create your Notion Integration ([Official Documentation](https://www.notion.so/profile/integrations))
- 🎫 Medium Token ([Official Documentation](https://medium.com/me/settings))
- 📊 Identified Notion pages and databases for export
  - Database ID is visible when the page is public
  - Grant permission to your integration app
    - Click on 3 dots on the top right of the page and select
    - check Connections and select your integration, should be listed

### Installation

1. 📥 Clone the repository
2. ⚙️ Configure environment variables:
   - Rename `.env-example` to `.env`
   - Add your tokens and database IDs:

```env
NOTION_KEY=secret_cZALRUr4CSrOXXXXXXXXXXXXXXXXXLucZIM7
NOTION_DB_IDs=1262c9f128f140000000006eb39c4,c64b0abe2af84000000000d0ae64
MEDIUM_TOKEN=2d048ec47XXXXXXXXXXXXXXX14df7ab6ae89da9aa0836f4ea0a5419f8
```

3. 🏃‍♂️ Run the application:
   ```bash
   npm install
   npm run start
   ```

### 🔧 Development & Debugging

```bash
# For browser debugging:
npm run dev --inspect
```

This enables DevTools in Chrome for manual breakpoint setting.

## 🏗️ Architecture

Our recommended architecture leverages Google Cloud components for a zero-cost, perpetual solution:

![Architecture Diagram](Readme%2085d09a8d95934e2cbc0b4da62a643f99/Untitled.png)

> 📺 Watch our detailed setup tutorial on our YouTube channel (Spanish with subtitles available)

## 📚 Tech Stack

| Library             | Purpose                               |
| ------------------- | ------------------------------------- |
| Express             | Web framework                         |
| Nodemon             | Development auto-reload               |
| Dotenv              | Environment configuration             |
| @notionhq/client    | Notion API client                     |
| notion-page-to-html | HTML conversion for Medium publishing |

### 🔍 Alternative Solutions

Consider checking out [notion-render](https://github.com/kerwanp/notion-render) for alternative approaches.

### 📚 Documentation

Those are ideas for my technical solution, not implemented yet, and not sure if will work at all, leave a star and follow for udpates.

- [The Extraction](docs/the_extraction.md)
- [Text DB Extraction](docs/text_db_extraction.md)
- [Hierarquy Extraction](docs/hierarquy_extraction.md)

## I created this project based on my own template, is open source as well :D

https://github.com/adamofig/dataclouder-template-node

## 🤝 Contributing

Contributions are welcome! The project is designed to be easy to understand and modify.
