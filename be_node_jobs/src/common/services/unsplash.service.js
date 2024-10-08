import { createApi } from "unsplash-js";
import * as fetch from "node-fetch";

const accessKey = process.env.UNSPLASH_ACCESS_KEY || "default";
const orientation = process.env.UNSPLASH_ORIENTATION || "landscape"; // Default 'landscape'

// Check for
if (!accessKey) {
  console.error(
    "Unsplash access key is missing. Make sure it is set in your .env file."
  );
}

const unsplash = createApi({
  accessKey,
  fetch: fetch.default
});

const getRandomFoodImage = async () => {
  try {
    const response = await unsplash.photos.getRandom({
      query: "food",
      orientation
    });

    // Check for a successful response
    if (!response || !response.response) {
      throw new Error(
        `Unexpected response from Unsplash API: ${JSON.stringify(response)}`
      );
    }

    return response.response.urls.full;
  } catch (error) {
    console.error(
      "Error fetching random food image from Unsplash:",
      error.message
    );

    throw new Error(`Error fetching random food image: ${error.message}`);
  }
};

export default { getRandomFoodImg: getRandomFoodImage };
