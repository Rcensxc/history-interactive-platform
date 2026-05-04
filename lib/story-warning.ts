export type StoryWarningItem = {
  code: string;
  message: string;
  sceneId?: string;
  beatId?: string;
  severity?: "warning";
  source?: "validator" | "adapter" | "fallback" | "runtime";
};

const warningSummaryPattern = /调试信息：AI 输出存在\s*(\d+)\s*条 warning/;
const warningDetailSplitPattern = /[\n；]+/g;
const fallbackWarningHints = ["已切回", "生成失败", "结构不合法", "无法转换"];

function trimWarningText(value: string) {
  return value.trim().replace(/[。．]\s*$/u, "");
}

function isFallbackWarning(rawWarning: string) {
  return fallbackWarningHints.some((hint) => rawWarning.includes(hint));
}

export function normalizeStoryWarnings(
  input?: string | string[] | StoryWarningItem[],
): StoryWarningItem[] {
  if (!input) {
    return [];
  }

  if (typeof input === "string") {
    const summaryMatch = input.match(warningSummaryPattern);
    if (summaryMatch) {
      const count = Number(summaryMatch[1]);
      return Array.from({ length: count }, (_, index) => ({
        code: `summary-warning-${index + 1}`,
        message: "AI 输出存在 warning",
        severity: "warning",
        source: "validator",
      }));
    }

    return input
      .split(warningDetailSplitPattern)
      .map(trimWarningText)
      .filter(Boolean)
      .map((message, index) => ({
        code: `generic-warning-${index + 1}`,
        message,
        severity: "warning" as const,
        source: "validator" as const,
      }));
  }

  if (input.length === 0) {
    return [];
  }

  if (typeof input[0] === "string") {
    return (input as string[])
      .map(trimWarningText)
      .filter(Boolean)
      .map((message, index) => ({
        code: `generic-warning-${index + 1}`,
        message,
        severity: "warning" as const,
        source: "validator" as const,
      }));
  }

  return (input as StoryWarningItem[]).filter((warning) => warning.message.trim().length > 0);
}

export function formatStoryWarningSummary(
  input?: string | string[] | StoryWarningItem[],
) {
  const warnings = normalizeStoryWarnings(input);
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

export function formatStoryWarningBanner(rawWarning: string): string;
export function formatStoryWarningBanner(
  rawWarning: string | undefined,
  fallbackMessage: string,
): string;
export function formatStoryWarningBanner(
  rawWarning?: string,
  fallbackMessage?: string,
): string | undefined {
  if (!rawWarning) {
    return fallbackMessage;
  }

  const normalizedRawWarning = rawWarning.trim();
  if (!normalizedRawWarning) {
    return fallbackMessage;
  }

  if (isFallbackWarning(normalizedRawWarning)) {
    return normalizedRawWarning;
  }

  return (
    formatStoryWarningSummary(normalizedRawWarning) ??
    fallbackMessage ??
    trimWarningText(normalizedRawWarning)
  );
}
