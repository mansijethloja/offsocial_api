const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Business Identity section
const BusinessIdentitySchema = new Schema({
  businessName: {
    type: String,
    trim: true,
    index: true
  },
  websiteUrl: {
    type: String,
    trim: true,
    required: true,
    index: true
  },
  live_status: {
    type: String,
    enum: ['reachable', null],
    default: null
  },
  ssl_certificate_status: {
    type: String,
    enum: ['valid', 'invalid', null],
    default: null
  },
  logo: {
    type: String,
    trim: true,
    default: null
  },
  favicon: {
    type: String,
    trim: true,
    default: null
  }
});

// Schema for Business Description section
const BusinessDescriptionSchema = new Schema({
  company_name: { type: String, default: null },
  tagline: { type: String, default: null },
  industry: { type: String, default: null },
  business_type: { type: String, default: null },
  founding_year: { type: String, default: null },
  headquarters: { type: String, default: null },
  company_size: { type: String, default: null },
  business_model: { type: String, default: null },
  products_services: [{ type: String }],
  unique_selling_proposition: { type: String, default: null },
  mission_statement: { type: String, default: null },
  vision_statement: { type: String, default: null },
  core_values: [{ type: String }]
});

// Schema for Target Audience section
const TargetAudienceSchema = new Schema({
  primary_audience: {
    demographics: {
      age_range: { type: String, default: null },
      gender: { type: String, default: null },
      income_level: { type: String, default: null },
      education_level: { type: String, default: null },
      geographic_location: { type: String, default: null }
    },
    psychographics: {
      interests: [{ type: String }],
      pain_points: [{ type: String }],
      goals: [{ type: String }],
      values: [{ type: String }]
    }
  },
  secondary_audience: {
    demographics: {
      age_range: { type: String, default: null },
      gender: { type: String, default: null },
      income_level: { type: String, default: null },
      education_level: { type: String, default: null },
      geographic_location: { type: String, default: null }
    },
    psychographics: {
      interests: [{ type: String }],
      pain_points: [{ type: String }],
      goals: [{ type: String }],
      values: [{ type: String }]
    }
  }
});

// Schema for Brand Voice and Tone section
const BrandVoiceSchema = new Schema({
  tone: [{ type: String }],
  communication_style: { type: String, default: null },
  vocabulary_complexity: { type: String, default: null },
  formal_vs_casual: { type: String, default: null }
});

// Schema for Website Analysis section
const WebsiteAnalysisSchema = new Schema({
  design_aesthetics: {
    color_palette: { type: String, default: null },
    typography: { type: String, default: null },
    layout: { type: String, default: null },
    imagery_style: { type: String, default: null },
    overall_impression: { type: String, default: null }
  },
  user_experience: {
    navigation_structure: { type: String, default: null },
    mobile_responsiveness: { type: String, default: null },
    page_loading_speed: { type: String, default: null },
    call_to_action_clarity: { type: String, default: null },
    accessibility: { type: String, default: null }
  },
  content_strategy: {
    content_types: [{ type: String }],
    content_themes: [{ type: String }],
    content_frequency: { type: String, default: null },
    storytelling_approach: { type: String, default: null }
  }
});

// Schema for Competitive Analysis section
const CompetitiveAnalysisSchema = new Schema({
  direct_competitors: [{
    name: { type: String, default: null },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }]
  }],
  market_positioning: {
    price_positioning: { type: String, default: null },
    quality_positioning: { type: String, default: null },
    innovation_positioning: { type: String, default: null },
    service_positioning: { type: String, default: null }
  },
  differentiation_factors: [{ type: String }]
});

// Schema for Marketing Strategy section
const MarketingStrategySchema = new Schema({
  channels: [{ type: String }],
  content_marketing_approach: { type: String, default: null },
  social_media_presence: {
    platforms: [{ type: String }],
    engagement_level: { type: String, default: null },
    content_style: { type: String, default: null }
  },
  seo_strategy: {
    keywords: [{ type: String }],
    ranking_potential: { type: String, default: null },
    content_optimization: { type: String, default: null }
  }
});

// Schema for Conversion Strategy section
const ConversionStrategySchema = new Schema({
  primary_conversion_goals: [{ type: String }],
  call_to_action_types: [{ type: String }],
  lead_generation_methods: [{ type: String }],
  sales_funnel_structure: { type: String, default: null }
});

// Schema for Recommendations section
const RecommendationsSchema = new Schema({
  branding_improvements: [{ type: String }],
  website_enhancements: [{ type: String }],
  content_recommendations: [{ type: String }],
  marketing_opportunities: [{ type: String }],
  conversion_optimization: [{ type: String }]
});

// Main Business DNA Schema
const BusinessDNASchema = new Schema({
  websiteUrl: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  primaryGoal: {
    type: String,
    trim: true
  },
  analysisDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  businessIdentity: BusinessIdentitySchema,
  businessDNA: {
    business_description: BusinessDescriptionSchema,
    target_audience: TargetAudienceSchema,
    brand_voice: BrandVoiceSchema,
    website_analysis: WebsiteAnalysisSchema,
    competitive_analysis: CompetitiveAnalysisSchema,
    marketing_strategy: MarketingStrategySchema,
    conversion_strategy: ConversionStrategySchema,
    recommendations: RecommendationsSchema
  },
  // Raw API response for potential future reprocessing
  rawResponse: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  strict: false // Allows flexibility for future structure changes
});

// Add indexes for common queries
BusinessDNASchema.index({ 'businessDNA.business_description.industry': 1 });
BusinessDNASchema.index({ 'businessDNA.business_description.business_type': 1 });
BusinessDNASchema.index({ 'businessDNA.target_audience.primary_audience.demographics.geographic_location': 1 });
BusinessDNASchema.index({ analysisDate: -1 }); // Most recent analyses

// Create the model
const BusinessDNA = mongoose.model('BusinessDNA', BusinessDNASchema);

module.exports = BusinessDNA;
