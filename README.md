# OffSocial API

## Overview

OffSocial API is a powerful website analysis tool designed to extract and analyze valuable insights from business websites. The API provides comprehensive analysis of business identity, website performance, content quality, and digital marketing strategy to help businesses improve their online presence.

## Features

### Business DNA Analysis
- Extracts core business information (name, industry, business type)
- Analyzes target audience and customer segments
- Identifies unique selling propositions (USPs) and value propositions
- Evaluates brand voice, tone, and positioning
- Assesses website health and security status
- Analyzes call-to-actions and engagement elements

### Page Speed Analysis
- Integration with Google PageSpeed API
- Performance metrics for mobile and desktop
- Loading time analysis
- Performance optimization recommendations

### Content Analysis
- Text readability scoring
- Sentiment analysis
- Keyword extraction and density analysis
- Content quality assessment
- SEO friendliness evaluation

### Lead Generation
- Lead capture and qualification
- Lead scoring and categorization

## Tech Stack

- **Backend**: Node.js, Express.js
- **AI Integration**: OpenAI API, LangChain
- **Web Scraping**: Puppeteer
- **Text Analysis**: Natural, Compromise, Sentiment, Text-Readability
- **Security**: Helmet, Express Rate Limit, CORS
- **Validation**: Joi, Zod, Express-Validator

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Google PageSpeed API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/offsocial_api.git
   cd offsocial_api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key
   PAGESPEED_API_KEY=your_pagespeed_api_key
   BASE_URL=https://www.googleapis.com/pagespeedonline/v5/runPagespeed
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Security Measures

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Request logging with sensitive data redaction

## Areas for Improvement

- Add comprehensive test suite
- Implement global error handler
- Add TypeScript support
- Implement database for storing analysis results
- Add authentication system
- Improve API documentation with Swagger/OpenAPI
- Add monitoring and health check system

## License

ISC License

## Author

OffSocial Team
