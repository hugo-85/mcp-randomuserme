# mcp-randomuserme MCP Server

Node.js server implementing the Model Context Protocol (MCP) for generating random user data using the randomuser.me API.

## Features

- Generate random users with customizable fields
- Simple MCP server implementation
- Easily integrates with MCP-compatible clients

## API

### Tools

#### getUsers

Generate random users with selected fields.

**Inputs:**

- `results` (number, optional): Number of users to generate (default: 1)
- `inc` (string[], optional): Array of fields to include (e.g., `["name", "gender", "email", "picture"]`)
- `gender` ("male" | "female", optional): Filter users by gender

**Example Request:**

```json
{
  "tool": "getUsers",
  "parameters": {
    "results": 5,
    "inc": ["name", "gender", "email", "picture"]
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

## Usage

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the server:**

   ```bash
   node main.ts
   ```

3. **Configure and use the MCP tool:**
   Use an MCP-compatible client to call the `getUsers` tool with your desired parameters.

## Requirements

- Node.js >= 18
- npm >= 10

## License

MIT
