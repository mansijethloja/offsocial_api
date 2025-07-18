const BusinessDNA = require('../models/business-dna.model');

/**
 * Creates a new business DNA record in the database
 * @param {Object} data - Business DNA analysis data
 * @param {string} url - Website URL that was analyzed
 * @returns {Promise<Object>} - Created business DNA document
 */
const createBusinessDNA = async (data, url) => {
  try {
    // Extract data from the analysis result
    const { businessDNA, businessIdentity } = data;
    
    // Ensure businessIdentity includes the websiteUrl (required by the schema)
    const enhancedBusinessIdentity = {
      ...businessIdentity,
      websiteUrl: url // Add the URL as this is required by our schema
    };
    
    // Check if an analysis for this URL already exists
    const existingAnalysis = await BusinessDNA.findOne({ websiteUrl: url });
    
    if (existingAnalysis) {
      // Update existing record
      existingAnalysis.businessDNA = businessDNA;
      existingAnalysis.businessIdentity = enhancedBusinessIdentity;
      existingAnalysis.analysisDate = new Date();
      
      await existingAnalysis.save();
      return existingAnalysis;
    } else {
      // Create new record
      const newBusinessDNA = new BusinessDNA({
        websiteUrl: url,
        businessIdentity: enhancedBusinessIdentity,
        businessDNA,
        analysisDate: new Date()
      });
      
      await newBusinessDNA.save();
      return newBusinessDNA;
    }
  } catch (error) {
    console.error('Error saving business DNA to database:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Retrieves a business DNA record by URL
 * @param {string} url - Website URL to find
 * @returns {Promise<Object>} - Business DNA document
 */
const getBusinessDNAByUrl = async (url) => {
  try {
    const businessDNA = await BusinessDNA.findOne({ websiteUrl: url });
    return businessDNA;
  } catch (error) {
    console.error('Error retrieving business DNA from database:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Retrieves all business DNA records
 * @param {Object} filters - Optional filters
 * @param {number} limit - Maximum number of records to return
 * @param {number} skip - Number of records to skip (for pagination)
 * @returns {Promise<Array>} - Array of business DNA documents
 */
const getAllBusinessDNA = async (filters = {}, limit = 10, skip = 0) => {
  try {
    const query = BusinessDNA.find(filters)
      .sort({ analysisDate: -1 })
      .limit(limit)
      .skip(skip);
      
    const businessDNA = await query.exec();
    return businessDNA;
  } catch (error) {
    console.error('Error retrieving business DNA records from database:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Deletes a business DNA record by ID
 * @param {string} id - MongoDB document ID
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
const deleteBusinessDNA = async (id) => {
  try {
    const result = await BusinessDNA.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting business DNA from database:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  createBusinessDNA,
  getBusinessDNAByUrl,
  getAllBusinessDNA,
  deleteBusinessDNA
};
