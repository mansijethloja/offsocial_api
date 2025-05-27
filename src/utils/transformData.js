const transformPerformanceData = (rawData) => {
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

  const audits = lighthouseResult.audits || {};

  if (Array.isArray(performanceCategory.auditRefs)) {
    result.auditRefs = performanceCategory.auditRefs
      .filter((ref) => ref.group === "metrics")
      .map((ref) => {
        const audit = audits[ref.id] || {};
        return {
          ...ref,
          score: typeof audit.score === "number" ? audit.score : null,
        };
      });
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
