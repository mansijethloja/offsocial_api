/**
 * Transforms raw Lighthouse performance data into a structured format for the UI
 * @param {Object} rawData - Raw data from PageSpeed Insights API
 * @returns {Object} - Structured performance data for the application
 */
const transformPerformanceData = (rawData) => {
  // Extract the Lighthouse result from the raw data
  const lighthouseResult = rawData.lighthouseResult;

  // Validate the response structure
  if (
    !lighthouseResult ||
    !lighthouseResult.categories ||
    !lighthouseResult.categories.performance
  ) {
    throw new Error(
      "Invalid PageSpeed Insights API response: Missing performance category data"
    );
  }

  // Get the performance category which contains the main score and audit references
  const performanceCategory = lighthouseResult.categories.performance;

  // Initialize the result structure with separate sections for metrics, passed audits, and other groups
  const result = {
    id: performanceCategory.id,
    title: performanceCategory.title,
    score: performanceCategory.score,
    auditRefs: [], // Will store metric references for gauge charts
    metrics: {
      // Separate container for core web vitals and metrics
      title: "Metrics",
      description: "Key performance metrics",
      audits: {}, // Will store individual metric audits
      count: 0, // Will store count of metrics
    },
    passedAudits: {
      // Container for audits that passed
      title: "Passed Audits",
      description: "",
      audits: {},
      count: 0,
    },
    categoryGroups: {}, // Will store all other audit groups (diagnostics, etc.)
  };

  // All audits from the Lighthouse result
  const audits = lighthouseResult.audits || {};

  // STEP 1: Process metric references for the gauge charts
  if (Array.isArray(performanceCategory.auditRefs)) {
    result.auditRefs = performanceCategory.auditRefs
      // Filter for only metric audits (like LCP, FID, CLS)
      .filter((ref) => ref.group === "metrics")
      // Map to include both the reference and the audit score
      .map((ref) => {
        const audit = audits[ref.id] || {};
        return {
          ...ref,
          score: typeof audit.score === "number" ? audit.score : null,
        };
      });
  }

  // STEP 2: Initialize audit groups (excluding 'hidden' and 'metrics')
  const auditGroups = {};
  if (lighthouseResult.categoryGroups) {
    Object.keys(lighthouseResult.categoryGroups).forEach((groupKey) => {
      // Skip hidden group and metrics (metrics are handled separately)
      if (groupKey !== "hidden" && groupKey !== "metrics") {
        auditGroups[groupKey] = {
          ...lighthouseResult.categoryGroups[groupKey], // Copy group info
          audits: {}, // Will store audits for this group
          count: 0, // Will store count of audits in group
        };
      }
    });
  }

  // STEP 3: Process all audits and categorize them
  if (lighthouseResult.audits) {
    // Create maps for quick lookup of audit groups and weights
    const auditToGroupMap = {};
    const auditToWeightMap = {};

    // Populate the group and weight maps from performance audit references
    performanceCategory.auditRefs.forEach((ref) => {
      if (ref.id) {
        auditToGroupMap[ref.id] = ref.group || null;
        auditToWeightMap[ref.id] = ref.weight || 0;
      }
    });

    // Process each audit
    Object.keys(audits).forEach((auditId) => {
      const audit = audits[auditId];
      const group = auditToGroupMap[auditId];

      // Skip hidden audits
      if (group === "hidden") return;

      // Determine if this is a passed audit (score=1 or not applicable)
      const isPassedAudit =
        ((audit.score === 1 && audit.scoreDisplayMode === "metricSavings") ||
          (audit.score === null &&
            audit.scoreDisplayMode === "notApplicable")) &&
        group !== "hidden";

      if (isPassedAudit) {
        // Add to passed audits
        result.passedAudits.audits[auditId] = audit;
      } else if (group === "metrics") {
        // Add to separate metrics container
        result.metrics.audits[auditId] = audit;
      } else if (group && auditGroups[group]) {
        // Add to appropriate category group
        auditGroups[group].audits[auditId] = audit;
      }
    });
  }

  // STEP 4: Sort and count metrics
  const metricAuditIds = Object.keys(result.metrics.audits);
  const sortedMetrics = {};
  // Sort metrics alphabetically by title
  metricAuditIds.sort((a, b) => {
    const titleA = result.metrics.audits[a].title || "";
    const titleB = result.metrics.audits[b].title || "";
    return titleA.localeCompare(titleB);
  });
  // Rebuild metrics object in sorted order
  metricAuditIds.forEach((id) => {
    sortedMetrics[id] = result.metrics.audits[id];
  });
  result.metrics.audits = sortedMetrics;
  result.metrics.count = metricAuditIds.length;

  // STEP 5: Process other category groups (diagnostics, etc.)
  Object.keys(auditGroups).forEach((groupKey) => {
    const group = auditGroups[groupKey];
    const sortedAudits = {};

    // Sort audits by score (worst first)
    const auditKeys = Object.keys(group.audits).sort((a, b) => {
      const auditA = group.audits[a];
      const auditB = group.audits[b];
      // Treat null scores as passing (1)
      const scoreA = typeof auditA.score === "number" ? auditA.score : 1;
      const scoreB = typeof auditB.score === "number" ? auditB.score : 1;
      return scoreA - scoreB; // Sort ascending (0.1 comes before 0.9)
    });

    // Rebuild group audits in sorted order
    auditKeys.forEach((key) => {
      sortedAudits[key] = group.audits[key];
    });

    group.audits = sortedAudits;
    group.count = Object.keys(group.audits).length;
  });

  // STEP 6: Process passed audits
  const passedAuditIds = Object.keys(result.passedAudits.audits);
  const sortedPassedAudits = {};
  // Sort passed audits alphabetically
  passedAuditIds.sort((a, b) => {
    const titleA = result.passedAudits.audits[a].title || "";
    const titleB = result.passedAudits.audits[b].title || "";
    return titleA.localeCompare(titleB);
  });
  // Rebuild passed audits in sorted order
  passedAuditIds.forEach((id) => {
    sortedPassedAudits[id] = result.passedAudits.audits[id];
  });
  result.passedAudits.audits = sortedPassedAudits;
  result.passedAudits.count = passedAuditIds.length;

  // STEP 7: Finalize category groups - only include non-empty groups
  result.categoryGroups = Object.fromEntries(
    Object.entries(auditGroups).filter(
      ([_, group]) => Object.keys(group.audits).length > 0
    )
  );

  return result;
};

const transformSeoData = (rawData) => {
  const lighthouseResult = rawData.lighthouseResult;

  if (
    !lighthouseResult ||
    !lighthouseResult.categories ||
    !lighthouseResult.categories.seo
  ) {
    throw new Error(
      "Invalid PageSpeed Insights API response: Missing SEO category data"
    );
  }

  const seoCategory = lighthouseResult.categories.seo;

  const result = {
    id: seoCategory.id,
    title: seoCategory.title,
    score: seoCategory.score,
    passedAudits: {
      title: "Passed Audits",
      description: "",
      audits: {},
      count: 0,
    },
    categoryGroups: {},
  };

  const audits = lighthouseResult.audits || {};

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
    const auditToGroupMap = {};
    const auditToWeightMap = {};

    seoCategory.auditRefs.forEach((ref) => {
      if (ref.id) {
        auditToGroupMap[ref.id] = ref.group || null;
        auditToWeightMap[ref.id] = ref.weight || 0;
      }
    });

    Object.keys(audits).forEach((auditId) => {
      const audit = audits[auditId];
      const group = auditToGroupMap[auditId];

      if (group === "hidden") return;

      const isPassedAudit = audit.score === 1 && group !== "hidden";

      if (isPassedAudit) {
        result.passedAudits.audits[auditId] = audit;
      } else if (group && auditGroups[group]) {
        auditGroups[group].audits[auditId] = audit;
      }
    });
  }

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

  result.categoryGroups = Object.fromEntries(
    Object.entries(auditGroups).filter(
      ([_, group]) => Object.keys(group.audits).length > 0
    )
  );

  return result;
};

const transformBestPracticesData = (rawData) => {
  const lighthouseResult = rawData.lighthouseResult;

  if (
    !lighthouseResult ||
    !lighthouseResult.categories ||
    !lighthouseResult.categories["best-practices"]
  ) {
    throw new Error(
      "Invalid PageSpeed Insights API response: Missing best practices category data"
    );
  }

  const bestPracticesCategory = lighthouseResult.categories["best-practices"];

  const result = {
    id: bestPracticesCategory.id,
    title: bestPracticesCategory.title,
    score: bestPracticesCategory.score,
    passedAudits: {
      title: "Passed Audits",
      description: "",
      audits: {},
      count: 0,
    },
    notApplicableAudits: {
      title: "Not Applicable",
      description: "",
      audits: {},
      count: 0,
    },
    categoryGroups: {},
  };

  const audits = lighthouseResult.audits || {};

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
    const auditToGroupMap = {};
    const auditToWeightMap = {};

    bestPracticesCategory.auditRefs.forEach((ref) => {
      if (ref.id) {
        auditToGroupMap[ref.id] = ref.group || null;
        auditToWeightMap[ref.id] = ref.weight || 0;
      }
    });

    Object.keys(audits).forEach((auditId) => {
      const audit = audits[auditId];
      const group = auditToGroupMap[auditId];

      if (group === "hidden") return;

      const isPassedAudit =
        audit?.score === 1 &&
        (audit?.scoreDisplayMode === "binary" ||
          audit?.scoreDisplayMode === "metricSavings") &&
        group !== "hidden";

      const isNotApplicableAudit =
        audit?.scoreDisplayMode === "notApplicable" && group !== "hidden";

      if (isPassedAudit) {
        result.passedAudits.audits[auditId] = audit;
      } else if (isNotApplicableAudit) {
        result.notApplicableAudits.audits[auditId] = audit;
      } else if (group && auditGroups[group]) {
        auditGroups[group].audits[auditId] = audit;
      }
    });
  }

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

  const passedAuditIds = Object.keys(result.passedAudits.audits);
  const notApplicableAuditIds = Object.keys(result.notApplicableAudits.audits);
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
  result.notApplicableAudits.count = notApplicableAuditIds.length;

  result.categoryGroups = Object.fromEntries(
    Object.entries(auditGroups).filter(
      ([_, group]) => Object.keys(group.audits).length > 0
    )
  );

  return result;
};

const transformAccessibilityData = (rawData) => {
  const lighthouseResult = rawData.lighthouseResult;

  if (
    !lighthouseResult ||
    !lighthouseResult.categories ||
    !lighthouseResult.categories.accessibility
  ) {
    throw new Error(
      "Invalid PageSpeed Insights API response: Missing accessibility category data"
    );
  }

  const accessibilityCategory = lighthouseResult.categories.accessibility;

  const result = {
    id: accessibilityCategory.id,
    title: accessibilityCategory.title,
    score: accessibilityCategory.score,
    passedAudits: {
      title: "Passed Audits",
      description: "",
      audits: {},
      count: 0,
    },
    notApplicableAudits: {
      title: "Not Applicable",
      description: "",
      audits: {},
      count: 0,
    },
    manualAudits: {
      title: "Additional items to manually check",
      description:
        "These items address areas which an automated testing tool cannot cover.",
      audits: {},
      count: 0,
    },
    categoryGroups: {},
  };

  const audits = lighthouseResult.audits || {};

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
    const auditToGroupMap = {};
    const auditToWeightMap = {};

    accessibilityCategory.auditRefs.forEach((ref) => {
      if (ref.id) {
        auditToGroupMap[ref.id] = ref.group || null;
        auditToWeightMap[ref.id] = ref.weight || 0;
      }
    });

    Object.keys(audits).forEach((auditId) => {
      const audit = audits[auditId];
      const group = auditToGroupMap[auditId];

      if (group === "hidden") return;

      const isPassedAudit =
        audit?.score === 1 &&
        (audit?.scoreDisplayMode === "binary" ||
          audit?.scoreDisplayMode === "metricSavings") &&
        group !== "hidden";

      const isNotApplicableAudit =
        audit?.scoreDisplayMode === "notApplicable" && group !== "hidden";

      const manualAuditCheck = audit?.scoreDisplayMode === "manual";

      if (isPassedAudit) {
        result.passedAudits.audits[auditId] = audit;
      } else if (isNotApplicableAudit) {
        result.notApplicableAudits.audits[auditId] = audit;
      } else if (manualAuditCheck) {
        result.manualAudits.audits[auditId] = audit;
      } else if (group && auditGroups[group]) {
        auditGroups[group].audits[auditId] = audit;
      }
    });
  }

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

  const passedAuditIds = Object.keys(result.passedAudits.audits);
  const notApplicableAuditIds = Object.keys(result.notApplicableAudits.audits);
  const manualAuditIds = Object.keys(result.manualAudits.audits);
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
  result.notApplicableAudits.count = notApplicableAuditIds.length;
  result.manualAudits.count = manualAuditIds.length;

  result.categoryGroups = Object.fromEntries(
    Object.entries(auditGroups).filter(
      ([_, group]) => Object.keys(group.audits).length > 0
    )
  );

  return result;
};

module.exports = {
  transformPerformanceData,
  transformSeoData,
  transformBestPracticesData,
  transformAccessibilityData,
};
