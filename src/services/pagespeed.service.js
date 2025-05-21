const axios = require("axios");

const BASE_URL = process.env.BASE_URL;
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;

const fetchPageSpeedData = async (url, category) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        url,
        category,
        key: PAGESPEED_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.log("**********fetchPageSpeedData error", error);

    throw new Error(error);
  }
};

module.exports = { fetchPageSpeedData };
