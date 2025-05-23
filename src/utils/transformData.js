/**
 * Transforms raw Google PageSpeed Insights API response into a structured format
 * for performance category data visualization and analysis
 *
 * @param {Object} rawData - The raw response from Google PageSpeed Insights API
 * @returns {Object} - Transformed data with auditRefs, passedAudits, and categoryGroups
 */
const transformPageSpeedData = (rawData) => {
  const lighthouseResult = rawData.lighthouseResult;

  if (
    !lighthouseResult ||
    !lighthouseResult.categories ||
    !lighthouseResult.categories.performance
  ) {
    throw new Error(
      "Invalid PageSpeed Insights API response: Missing performance category data"
    );
  }

  const performanceCategory = lighthouseResult.categories.performance;

  const result = {
    id: performanceCategory.id,
    title: performanceCategory.title,
    score: performanceCategory.score,
    auditRefs: [],
    passedAudits: {
      title: "Passed Audits",
      description: "",
      audits: {},
      count: 0,
    },
    categoryGroups: {},
  };

  if (Array.isArray(performanceCategory.auditRefs)) {
    result.auditRefs = performanceCategory.auditRefs.filter(
      (ref) => ref.group === "metrics"
    );
  }

  const auditGroups = {};
  if (lighthouseResult.categoryGroups) {
    Object.keys(lighthouseResult.categoryGroups).forEach((groupKey) => {
      if (groupKey !== "hidden") {
        auditGroups[groupKey] = {
          ...lighthouseResult.categoryGroups[groupKey],
          audits: {},
          count: 0,
        };
      }
    });
  }

  if (lighthouseResult.audits) {
    const audits = lighthouseResult.audits;

    const auditToGroupMap = {};
    const auditToWeightMap = {};

    performanceCategory.auditRefs.forEach((ref) => {
      if (ref.id) {
        auditToGroupMap[ref.id] = ref.group || null;
        auditToWeightMap[ref.id] = ref.weight || 0;
      }
    });

    Object.keys(audits).forEach((auditId) => {
      const audit = audits[auditId];
      const group = auditToGroupMap[auditId];

      if (group === "hidden") return;

      //Passed Audit Logic
      const isPassedAudit =
        ((audit.score === 1 && audit.scoreDisplayMode === "metricSavings") ||
          (audit.score === null &&
            audit.scoreDisplayMode === "notApplicable")) &&
        group !== "hidden";

      if (isPassedAudit) {
        result.passedAudits.audits[auditId] = audit;
      } else if (group && auditGroups[group]) {
        auditGroups[group].audits[auditId] = audit;
      }
    });
  }

  // Sort and count audits in each group
  Object.keys(auditGroups).forEach((groupKey) => {
    const group = auditGroups[groupKey];
    const sortedAudits = {};

    const auditKeys = Object.keys(group.audits).sort((a, b) => {
      const auditA = group.audits[a];
      const auditB = group.audits[b];
      const scoreA = typeof auditA.score === "number" ? auditA.score : 1;
      const scoreB = typeof auditB.score === "number" ? auditB.score : 1;
      return scoreA - scoreB;
    });

    auditKeys.forEach((key) => {
      sortedAudits[key] = group.audits[key];
    });

    group.audits = sortedAudits;
    group.count = Object.keys(group.audits).length;
  });

  // Sort passed audits and count them
  const passedAuditIds = Object.keys(result.passedAudits.audits);
  const sortedPassedAudits = {};

  passedAuditIds.sort((a, b) => {
    const titleA = result.passedAudits.audits[a].title || "";
    const titleB = result.passedAudits.audits[b].title || "";
    return titleA.localeCompare(titleB);
  });

  passedAuditIds.forEach((id) => {
    sortedPassedAudits[id] = result.passedAudits.audits[id];
  });

  result.passedAudits.audits = sortedPassedAudits;
  result.passedAudits.count = passedAuditIds.length;

  // Only include category groups that have audits
  result.categoryGroups = Object.fromEntries(
    Object.entries(auditGroups).filter(
      ([_, group]) => Object.keys(group.audits).length > 0
    )
  );

  return result;
};

module.exports = transformPageSpeedData;
