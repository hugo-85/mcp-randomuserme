import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-randomuserme",
  version: "1.0.0",
});

const nationalitiesTypes = z.enum([
  "AU",
  "BR",
  "CA",
  "CH",
  "DE",
  "DK",
  "ES",
  "FI",
  "FR",
  "GB",
  "IE",
  "IN",
  "IR",
  "MX",
  "NL",
  "NO",
  "NZ",
  "RS",
  "TR",
  "UA",
  "US",
]);

const availableFields = z.enum([
  "gender",
  "name",
  "location",
  "email",
  "login",
  "registered",
  "dob",
  "phone",
  "cell",
  "id",
  "picture",
  "nat",
]);

server.tool(
  "getUsers",
  "Fetch a random user",
  {
    results: z
      .number()
      .optional()
      .describe("The number of users that generates"),
    gender: z
      .enum(["male", "female"])
      .optional()
      .describe("The gender of the user"),
    password: z
      .object({
        charset: z
          .array(z.enum(["special", "upper", "lower", "number"]))
          .describe("The complexity of the password"),
        min: z
          .number()
          .optional()
          .describe("The minimum length of the password"),
        max: z
          .number()
          .optional()
          .describe("The maximum length of the password"),
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
  },
  async (params) => {
    let baseUrl = `https://randomuser.me/api`;

    const queryParams = new URLSearchParams();

    if (params?.results) {
      queryParams.append("results", params.results.toString());
    }
    if (params?.gender) {
      queryParams.append("gender", params.gender);
    }
    if (
      (params?.password?.charset && params.password.charset.length > 0) ||
      params?.password?.min ||
      params?.password?.max
    ) {
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
    if (params?.seed) {
      queryParams.append("seed", params.seed);
    }
    if (params?.nationalities && params.nationalities.length > 0) {
      queryParams.append("nat", params.nationalities.join(","));
    }
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
    if (params?.inc && params.inc.length > 0) {
      queryParams.append("inc", params.inc.join(","));
    }
    if (params?.exc && params.exc.length > 0) {
      queryParams.append("exc", params.exc.join(","));
    }

    const response = await fetch(`${baseUrl}?${queryParams}`);
    const data = await response.json();
    const users = JSON.stringify(data);

    return {
      content: [
        {
          type: "text",
          text: users,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
