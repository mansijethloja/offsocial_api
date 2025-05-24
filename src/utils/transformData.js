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

module.exports = transformPageSpeedData;
