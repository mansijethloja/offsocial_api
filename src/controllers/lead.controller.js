const axios = require("axios");
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_BASE_URL =
  process.env.APOLLO_BASE_URL || "https://api.apollo.io/v1";

const getLeads = async (req, res) => {
  try {
    const { searchQuery, page = 1 } = req.body;

    const response = await axios.post(
      `${APOLLO_BASE_URL}/mixed_people/search`,
      {
        q_keywords: searchQuery,
        page,
        per_page: 10,
      },
      {
        headers: {
          accept: "application/json",
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          "X-Api-Key": APOLLO_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Apollo.io API error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

const enrichLead = async (req, res) => {
  try {
    const { email, firstName, lastName, companyName } = req.body;

    const response = await axios.post(
      `${APOLLO_BASE_URL}/people/match`,
      {
        email,
        first_name: firstName,
        last_name: lastName,
        organization_name: companyName,
      },
      {
        headers: {
          accept: "application/json",
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          "X-Api-Key": APOLLO_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Apollo.io enrichment error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to enrich lead" });
  }
};

module.exports = {
  getLeads,
  enrichLead,
};
