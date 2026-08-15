import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as z from "zod";

// === Official docs example, verbatim: https://ai.google.dev/gemini-api/docs/structured-output ===
const recipeJsonSchema = {
    type: "object",
    properties: {
        recipe_name: {
            type: "string",
            description: "The name of the recipe."
        },
        prep_time_minutes: {
            type: "integer",
            description: "Optional time in minutes to prepare the recipe."
        },
        ingredients: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Name of the ingredient." },
                    quantity: { type: "string", description: "Quantity of the ingredient, including units." }
                },
                required: ["name", "quantity"]
            }
        },
        instructions: {
            type: "array",
            items: { type: "string" }
        }
    },
    required: ["recipe_name", "ingredients", "instructions"]
};
const recipeSchema = z.fromJSONSchema(recipeJsonSchema);
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prompt = `Please extract the recipe from the following text.
The user wants to make delicious chocolate chip cookies.
They need 2 and 1/4 cups of all-purpose flour, 1 teaspoon of baking soda,
1 teaspoon of salt, 1 cup of unsalted butter (softened), 3/4 cup of granulated sugar,
3/4 cup of packed brown sugar, 1 teaspoon of vanilla extract, and 2 large eggs.
For the best part, they'll need 2 cups of semisweet chocolate chips.
First, preheat the oven to 375°F (190°C). Then, in a small bowl, whisk together the flour,
baking soda, and salt. In a large bowl, cream together the butter, granulated sugar, and brown sugar
until light and fluffy. Beat in the vanilla and eggs, one at a time. Gradually beat in the dry
ingredients until just combined. Finally, stir in the chocolate chips. Drop by rounded tablespoons
onto ungreased baking sheets and bake for 9 to 11 minutes.`;

const interaction = await client.interactions.create({
    model: "gemini-3-flash-preview",
    input: prompt,
    response_format: {
        type: "text",
        mime_type: "application/json",
        schema: recipeJsonSchema
    },
});
const recipe = recipeSchema.parse(JSON.parse(interaction.output_text));
console.log("=== RECIPE EXAMPLE RESULT ===");
console.log(JSON.stringify(recipe, null, 2));
