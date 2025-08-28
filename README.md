# mcp-randomuserme MCP Server

Node.js server implementing the Model Context Protocol (MCP) for generating random user data using the randomuser.me API.

[![npm version](https://img.shields.io/npm/v/mcp-randomuserme.svg)](https://www.npmjs.com/package/mcp-randomuserme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Generate random users with customizable fields
- Filter by gender, nationality, and specific fields
- Seed-based generation for reproducible results
- Pagination support
- Simple MCP server implementation
- Easily integrates with MCP-compatible clients

## API

### Tools

#### getUsers

Generate random users with selected fields.

**Inputs:**

- `results` (number, optional): Number of users to generate (default: 1)
- `gender` ("male" | "female", optional): Filter users by gender
- `seed` (string, optional): Seeds allow you to always generate the same set of users
- `password` (object, optional): Password generation parameters
  - `charset` (array): The complexity of the password (options: "special", "upper", "lower", "number")
  - `min` (number, optional): The minimum length of the password
  - `max` (number, optional): The maximum length of the password
- `nationalities` (string[], optional): The nationalities of the user. Allowed values: AU, BR, CA, CH, DE, DK, ES, FI, FR, GB, IE, IN, IR, MX, NL, NO, NZ, RS, TR, UA, US
- `pagination` (object, optional): You can request multiple pages of a seed
  - `page` (number, optional): The page number to retrieve
  - `results` (number, optional): The number of results to retrieve
  - `seed` (string, optional): The seed for the random user generation
- `inc` (string[], optional): Array of fields to include. Allowed fields: gender, name, location, email, login, registered, dob, phone, cell, id, picture, nat
- `exc` (string[], optional): Array of fields to exclude. Allowed fields: gender, name, location, email, login, registered, dob, phone, cell, id, picture, nat

**Example Requests:**

Basic request:

```json
{
  "tool": "getUsers",
  "parameters": {
    "results": 5,
    "inc": ["name", "gender", "email", "picture"]
  }
}
```

Advanced request with filtering:

```json
{
  "tool": "getUsers",
  "parameters": {
    "results": 3,
    "gender": "female",
    "nationalities": ["US", "GB", "FR"],
    "seed": "myseed123",
    "inc": ["name", "location", "email", "dob"]
  }
}
```

With password generation:

```json
{
  "tool": "getUsers",
  "parameters": {
    "results": 2,
    "password": {
      "charset": ["upper", "lower", "number", "special"],
      "min": 8,
      "max": 12
    }
  }
}
```

**Example Response:**

```json
{
  "results": [
    {
      "gender": "male",
      "name": { "title": "Mr", "first": "Mateja", "last": "Ivić" },
      "email": "mateja.ivic@example.com",
      "picture": {
        "large": "https://randomuser.me/api/portraits/men/30.jpg",
        "medium": "https://randomuser.me/api/portraits/med/men/30.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/men/30.jpg"
      }
    }
    // ...more users
  ]
}
```

## Installation

### As a dependency in your project

```bash
npm install mcp-randomuserme
```

### Global installation

```bash
npm install -g mcp-randomuserme
```

## Usage

### As a library in your project

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcp-randomuserme } from "mcp-randomuserme";

// Initialize your MCP server with the randomuserme tool
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

// Your server setup code...
```

### Running as a standalone server

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Run the server:**

   ```bash
   npm start
   ```

4. **Configure and use the MCP tool:**
   Use an MCP-compatible client to call the `getUsers` tool with your desired parameters.

### Inspect the MCP server

You can use the MCP inspector to test and explore the server:

```bash
npm run inspect
```

### Using with Visual Studio Code

To use this MCP server in Visual Studio Code:

1. Open your VS Code settings and locate the MCP configuration file (`mcp.json`), or create one if it doesn't exist
2. Add the randomuserme server configuration as follows:

```json
{
  "servers": {
    "randomuserme": {
      "command": "npx",
      "args": ["-y", "mcp-randomuserme"]
    }
  }
}
```

3. Once configured, you can use the randomuserme MCP server with VS Code's MCP-compatible features

## Available Fields

The following fields can be included or excluded using the `inc` and `exc` parameters:

- `gender`: The user's gender (male/female)
- `name`: Title, first name, and last name
- `location`: Street, city, state, country, postcode, coordinates, timezone
- `email`: Email address
- `login`: Username, password, MD5, SHA-1, SHA-256, UUID, etc.
- `registered`: Registration date and age
- `dob`: Date of birth and age
- `phone`: Phone number
- `cell`: Cell phone number
- `id`: Identification information (name and value)
- `picture`: Large, medium, and thumbnail profile pictures
- `nat`: Nationality

## Requirements

- Node.js >= 18
- npm >= 10

## Development

### Building the project

```bash
npm run build
```

### Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on the [GitHub repository](https://github.com/hugo-85/mcp-randomuserme).

## Credits

This project uses the [Random User Generator API](https://randomuser.me/) and implements the [Model Context Protocol](https://modelcontextprotocol.github.io/).

## License

MIT
