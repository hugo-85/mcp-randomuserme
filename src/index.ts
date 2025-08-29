#!/usr/bin/env node

/**
 * @fileoverview MCP Server implementation for randomuser.me API
 *
 * This file implements a Model Context Protocol (MCP) server that wraps the
 * randomuser.me API, allowing MCP clients to generate random user data with
 * various filtering options and customizations.
 *
 * @author Hugo Margiotta
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Create a new MCP server instance
 * This server will handle MCP requests and communicate with the randomuser.me API
 */
const server = new McpServer({
  name: "mcp-randomuserme",
  version: "1.0.0",
});

/**
 * Valid nationality codes supported by the randomuser.me API
 * These are used to filter users by nationality
 *
 * @constant {z.ZodEnum<[string, ...string[]]>}
 */
const nationalitiesTypes = z.enum([
  "AU", // Australia
  "BR", // Brazil
  "CA", // Canada
  "CH", // Switzerland
  "DE", // Germany
  "DK", // Denmark
  "ES", // Spain
  "FI", // Finland
  "FR", // France
  "GB", // United Kingdom
  "IE", // Ireland
  "IN", // India
  "IR", // Iran
  "MX", // Mexico
  "NL", // Netherlands
  "NO", // Norway
  "NZ", // New Zealand
  "RS", // Serbia
  "TR", // Turkey
  "UA", // Ukraine
  "US", // United States
]);

/**
 * Fields available in the randomuser.me API response
 * These can be included or excluded using the inc/exc parameters
 *
 * @constant {z.ZodEnum<[string, ...string[]]>}
 */
const availableFields = z.enum([
  "gender", // User's gender (male/female)
  "name", // Title, first name, and last name
  "location", // Street, city, state, country, postcode, coordinates, timezone
  "email", // Email address
  "login", // Username, password, MD5, SHA-1, SHA-256, UUID, etc.
  "registered", // Registration date and age
  "dob", // Date of birth and age
  "phone", // Phone number
  "cell", // Cell phone number
  "id", // Identification information (name and value)
  "picture", // Large, medium, and thumbnail profile pictures
  "nat", // Nationality
]);

/**
 * Zod schema for the getUsers tool parameters
 * Defines the structure and validation rules for all possible input parameters
 *
 * @constant {Object}
 */
const getUsersSchema = {
  results: z.number().optional().describe("The number of users that generates"),
  gender: z
    .enum(["male", "female"])
    .optional()
    .describe("The gender of the user"),
  password: z
    .object({
      charset: z
        .array(z.enum(["special", "upper", "lower", "number"]))
        .describe("The complexity of the password"),
      min: z.number().optional().describe("The minimum length of the password"),
      max: z.number().optional().describe("The maximum length of the password"),
    })
    .optional(),
  seed: z
    .string()
    .optional()
    .describe("Seeds allow you to always generate the same set of users"),
  nationalities: z
    .array(nationalitiesTypes)
    .optional()
    .describe(
      "The nationalities of the user. Allowed: AU, BR, CA, CH, DE, DK, ES, FI, FR, GB, IE, IN, IR, MX, NL, NO, NZ, RS, TR, UA, US"
    ),
  pagination: z
    .object({
      page: z
        .number()
        .min(1)
        .optional()
        .describe("The page number to retrieve"),
      results: z
        .number()
        .optional()
        .describe("The number of results to retrieve"),
      seed: z
        .string()
        .optional()
        .describe("The seed for the random user generation"),
    })
    .optional()
    .describe(
      "You can request multiple pages of a seed with the page parameter"
    ),
  inc: z
    .array(availableFields)
    .optional()
    .describe(
      "Includes only the specified fields in the response. Allowed: gender, name, location, email, login, registered, dob, phone, cell, id, picture, nat"
    ),
  exc: z
    .array(availableFields)
    .optional()
    .describe(
      "Excludes the specified fields from the response. Allowed: gender, name, location, email, login, registered, dob, phone, cell, id, picture, nat"
    ),
};

/**
 * Register the getUsers tool with the MCP server
 *
 * This tool allows clients to generate random user data through the randomuser.me API
 * with various filtering and customization options.
 */
server.tool(
  "getUsers", // Tool name
  "Fetch random users", // Tool description
  getUsersSchema, // Parameter schema definition
  {
    title: "Get random users", // Display title
    readOnlyHint: true, // This tool doesn't modify any state
    destructiveHint: false, // This tool isn't destructive
    idempotentHint: false, // Multiple calls may return different results
    openWorldHint: true, // Connects to external API
  },
  /**
   * Implementation of the getUsers tool
   *
   * @param {Object} params - The parameters for the tool, validated against getUsersSchema
   * @returns {Promise<Object>} - Promise resolving to the MCP content response
   */
  async (params) => {
    try {
      // Base URL for the randomuser.me API
      let baseUrl = `https://randomuser.me/api`;

      // Build query parameters from user input
      const queryParams = new URLSearchParams();

      // Number of users to generate
      if (params?.results) {
        queryParams.append("results", params.results.toString());
      }

      // Gender filter
      if (params?.gender) {
        queryParams.append("gender", params.gender);
      }
      // Password generation options
      if (
        (params?.password?.charset && params.password.charset.length > 0) ||
        params?.password?.min ||
        params?.password?.max
      ) {
        // Format password parameters according to randomuser.me API requirements
        // Format: charset,min-max (e.g., "upper,lower,number,8-12")
        let password = params.password.charset?.join(",");
        const { min, max } = params.password;
        if (min && max) {
          password += `,${min}-${max}`;
        } else if (min) {
          password += `,${min}`;
        } else {
          password += `,${max}`;
        }

        queryParams.append("password", JSON.stringify(password));
      }

      // Seed for reproducible results
      if (params?.seed) {
        queryParams.append("seed", params.seed);
      }

      // Nationality filters (nat parameter in the API)
      if (params?.nationalities && params.nationalities.length > 0) {
        queryParams.append("nat", params.nationalities.join(","));
      }

      // Pagination parameters
      if (params?.pagination) {
        if (params?.pagination?.page) {
          queryParams.append("page", params?.pagination?.page.toString());
        }
        if (params?.pagination?.results) {
          queryParams.append("results", params?.pagination?.results.toString());
        }
        if (params?.pagination?.seed) {
          queryParams.append("seed", params?.pagination?.seed);
        }
      }

      // Field inclusion filters
      if (params?.inc && params.inc.length > 0) {
        queryParams.append("inc", params.inc.join(","));
      }

      // Field exclusion filters
      if (params?.exc && params.exc.length > 0) {
        queryParams.append("exc", params.exc.join(","));
      }

      // Make the API request to randomuser.me
      const response = await fetch(`${baseUrl}?${queryParams}`);

      // Parse the JSON response
      const data = await response.json();

      // Convert back to string for MCP response
      const users = JSON.stringify(data);

      // Return the result as MCP content
      return {
        content: [
          {
            type: "text",
            text: users,
          },
        ],
      };
    } catch (error) {
      // Handle any errors and return an error message
      return {
        content: [
          {
            type: "text",
            text: "Error fetching random users",
          },
        ],
      };
    }
  }
);

/**
 * Set up the MCP server with standard I/O transport
 * This allows the server to communicate via stdin/stdout
 */
const transport = new StdioServerTransport();
await server.connect(transport);

/**
 * Start the MCP server
 * Initializes the transport layer and connects the server to it
 *
 * @returns {Promise<void>}
 */
const start = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Randomuserme MCP server running on stdio");
};

// Start the server and handle any errors
start().catch((error) => {
  console.error("Failed to start server:", error);
});
