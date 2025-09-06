import type { AnalyticsEvent, AnalyticsStore } from '../types';

const analyticsStore: AnalyticsStore = {
  events: [],
  userSession: {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    textChecks: 0,
    errorsFound: 0,
    suggestionsApplied: 0,
    textsCopied: 0,
    textsDownloaded: 0,
    totalCharactersChecked: 0,
  },
};

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const trackEvent = (eventName: string, properties: Record<string, unknown> = {}) => {
  const event = {
    eventName,
    properties,
    timestamp: Date.now(),
    sessionId: analyticsStore.userSession.sessionId,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  analyticsStore.events.push(event);

  updateSessionMetrics(eventName, properties);

  if (import.meta.env.PROD) {
    sendToAnalyticsService(event);
  } else {
    console.log("📊 Analytics Event:", event);
  }
};

const updateSessionMetrics = (eventName: string, properties: Record<string, unknown>) => {
  const session = analyticsStore.userSession;

  switch (eventName) {
    case "grammar_check_started":
      session.textChecks++;
      if (typeof properties.textLength === 'number') {
        session.totalCharactersChecked += properties.textLength;
      }
      break;
    case "grammar_check_completed":
      if (typeof properties.errorsFound === 'number') {
        session.errorsFound += properties.errorsFound;
      }
      break;
    case "suggestion_applied":
      session.suggestionsApplied++;
      break;
    case "text_copied":
      session.textsCopied++;
      break;
    case "text_downloaded":
      session.textsDownloaded++;
      break;
  }
};

const sendToAnalyticsService = async (event: AnalyticsEvent) => {
  try {
    const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;

    if (analyticsEndpoint) {
      await fetch(analyticsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    }
  } catch (error) {
    console.error("Failed to send analytics:", error);
  }
};

export const getSessionSummary = () => {
  return {
    ...analyticsStore.userSession,
    sessionDuration: Date.now() - analyticsStore.userSession.startTime,
    eventsCount: analyticsStore.events.length,
    averageTextLength:
      analyticsStore.userSession.textChecks > 0
        ? analyticsStore.userSession.totalCharactersChecked /
          analyticsStore.userSession.textChecks
        : 0,
    errorRate:
      analyticsStore.userSession.totalCharactersChecked > 0
        ? analyticsStore.userSession.errorsFound /
          analyticsStore.userSession.totalCharactersChecked
        : 0,
    suggestionAcceptanceRate:
      analyticsStore.userSession.errorsFound > 0
        ? analyticsStore.userSession.suggestionsApplied /
          analyticsStore.userSession.errorsFound
        : 0,
  };
};

export const trackPremiumFeature = (featureName: string, properties: Record<string, unknown> = {}) => {
  trackEvent("premium_feature_attempted", {
    feature: featureName,
    ...properties,
  });
};

export const trackUserEngagement = () => {
  const summary = getSessionSummary();

  let engagementLevel = "low";
  if (summary.textChecks >= 3 && summary.suggestionAcceptanceRate > 0.3) {
    engagementLevel = "high";
  } else if (
    summary.textChecks >= 1 &&
    summary.suggestionAcceptanceRate > 0.1
  ) {
    engagementLevel = "medium";
  }

  trackEvent("user_engagement_calculated", {
    level: engagementLevel,
    metrics: summary,
  });

  return engagementLevel;
};

export const trackConversionOpportunity = (trigger: string, context: Record<string, unknown> = {}) => {
  trackEvent("conversion_opportunity", {
    trigger, // e.g., 'rate_limit_hit', 'feature_limit_reached', 'high_usage'
    context,
  });
};

export const getBusinessMetrics = () => {
  const summary = getSessionSummary();

  return {
    textsProcessed: summary.textChecks,
    totalCharacters: summary.totalCharactersChecked,
    errorsDetected: summary.errorsFound,
    fixesApplied: summary.suggestionsApplied,

    sessionDuration: summary.sessionDuration,
    actionsPerSession: summary.eventsCount,

    errorDetectionRate: summary.errorRate,
    userSatisfactionScore: summary.suggestionAcceptanceRate,

    contentExports: summary.textsCopied + summary.textsDownloaded,

    premiumFeatureInterest: analyticsStore.events.filter(
      (e: AnalyticsEvent) => e.eventName === "premium_feature_attempted"
    ).length,
    highValueUser:
      summary.textChecks >= 5 || summary.totalCharactersChecked >= 10000,
  };
};

export const initializeAnalytics = () => {
  trackEvent("app_initialized", {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  document.addEventListener("visibilitychange", () => {
    trackEvent("page_visibility_changed", {
      hidden: document.hidden,
    });
  });

  window.addEventListener("beforeunload", () => {
    const metrics = getBusinessMetrics();
    trackEvent("session_ended", { metrics });
  });
};

export const exportAnalyticsData = () => {
  return {
    events: analyticsStore.events,
    session: analyticsStore.userSession,
    businessMetrics: getBusinessMetrics(),
  };
};

export const clearAnalyticsData = () => {
  analyticsStore.events = [];
  analyticsStore.userSession = {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    textChecks: 0,
    errorsFound: 0,
    suggestionsApplied: 0,
    textsCopied: 0,
    textsDownloaded: 0,
    totalCharactersChecked: 0,
  };

  trackEvent("analytics_data_cleared");
};
