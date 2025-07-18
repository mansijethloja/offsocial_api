const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    businessIdentity: {
      businessName: { type: String, required: true },
      live_status: {
        type: String,
        enum: ["reachable", "unreachable", "unknown"],
        default: "unknown",
      },
      ssl_certificate_status: {
        type: String,
        enum: ["valid", "invalid", "unknown"],
        default: "unknown",
      },
      logo: { type: String },
      favicon: { type: String },
    },

    businessDNA: {
      business_description: {
        short_introduction: { type: String },
        long_description: { type: String },
        mission_vision: { type: String },
        tagline: { type: String },
      },

      brand_evaluation: {
        core_message: { type: String },
        brand_voice: { type: String },
        value_proposition: { type: String },
      },

      products_services: {
        offerings: [
          {
            category: { type: String },
            items: [String],
          },
        ],
      },

      target_audience: {
        primary_segments: [String],
        use_cases: [String],
        industries_served: [String],
      },

      usps: {
        core_differentiators: [String],
        themes: [String],
      },

      tone_of_voice: {
        sentiment: [String],
        style_classification: [String],
      },

      competitor_industry_positioning: {
        inferred_competitors: [
          {
            brand: { type: String },
            web_presence: { type: String },
            visual_identity: { type: String },
            social_strategy: { type: String, default: null },
            engagement: { type: mongoose.Schema.Types.Mixed, default: null },
          },
        ],
        industry_niche: { type: String },
        market_positioning: { type: String },
      },

      branding_elements: {
        color_palette: { type: [String], default: null },
        typography: { type: [String], default: null },
        imagery_themes: [String],
        consistency_notes: { type: String },
      },

      call_to_actions: {
        primary_ctas: [String],
        placement_strategy: [String],
        engagement_flow: { type: String },
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model("BusinessDNA", BusinessSchema);
