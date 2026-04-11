import { adaptAiStructuredStoryToPlayableContent } from "@/lib/ai-scene-adapter";
import {
  aiStructuredStoryFixtures,
  eventPlayableContent,
} from "@/data/history-registry";
import {
  validateAiStructuredStoryOutput,
  validateEventPlayableContent,
} from "@/lib/story-protocol-validation";

export type StoryFixtureValidationSummary = {
  ok: boolean;
  errorCount: number;
  warningCount: number;
  checks: Array<{
    name: string;
    ok: boolean;
    errorCount: number;
    warningCount: number;
  }>;
  lines: string[];
};

export function runStoryProtocolFixtureValidation(): StoryFixtureValidationSummary {
  const lines: string[] = [];
  const checks: StoryFixtureValidationSummary["checks"] = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const [eventId, playableContent] of Object.entries(eventPlayableContent)) {
    const report = validateEventPlayableContent(playableContent);
    errorCount += report.errors.length;
    warningCount += report.warnings.length;

    checks.push({
      name: `正式剧情协议 / ${eventId}`,
      ok: report.ok,
      errorCount: report.errors.length,
      warningCount: report.warnings.length,
    });

    lines.push(
      `${report.ok ? "PASS" : "FAIL"} 正式剧情协议 / ${eventId} (errors: ${report.errors.length}, warnings: ${report.warnings.length})`,
    );

    for (const issue of [...report.errors, ...report.warnings]) {
      lines.push(
        `  - [${issue.severity}] ${issue.sceneId ? `${issue.sceneId}: ` : ""}${issue.message}`,
      );
    }
  }

  for (const [fixtureId, fixture] of Object.entries(aiStructuredStoryFixtures)) {
    const aiReport = validateAiStructuredStoryOutput(fixture.output, {
      target: fixtureId,
      backgrounds: fixture.backgrounds,
      speakerVisuals: fixture.speakerVisuals,
    });
    errorCount += aiReport.errors.length;
    warningCount += aiReport.warnings.length;

    checks.push({
      name: `AI 结构化协议 / ${fixtureId}`,
      ok: aiReport.ok,
      errorCount: aiReport.errors.length,
      warningCount: aiReport.warnings.length,
    });

    lines.push(
      `${aiReport.ok ? "PASS" : "FAIL"} AI 结构化协议 / ${fixtureId} (errors: ${aiReport.errors.length}, warnings: ${aiReport.warnings.length})`,
    );

    for (const issue of [...aiReport.errors, ...aiReport.warnings]) {
      lines.push(
        `  - [${issue.severity}] ${issue.sceneId ? `${issue.sceneId}: ` : ""}${issue.message}`,
      );
    }

    const adaptedContent = adaptAiStructuredStoryToPlayableContent({
      eventId: fixtureId,
      output: fixture.output,
      defaultBackdrop:
        fixture.backgrounds["river-night"] ?? Object.values(fixture.backgrounds)[0],
      backgrounds: fixture.backgrounds,
      viewpoints: eventPlayableContent[fixtureId]?.viewpoints ?? [],
      speakerVisuals: fixture.speakerVisuals,
    });
    const adaptedReport = validateEventPlayableContent(adaptedContent);
    errorCount += adaptedReport.errors.length;
    warningCount += adaptedReport.warnings.length;

    checks.push({
      name: `AI 适配后正式剧情 / ${fixtureId}`,
      ok: adaptedReport.ok,
      errorCount: adaptedReport.errors.length,
      warningCount: adaptedReport.warnings.length,
    });

    lines.push(
      `${adaptedReport.ok ? "PASS" : "FAIL"} AI 适配后正式剧情 / ${fixtureId} (errors: ${adaptedReport.errors.length}, warnings: ${adaptedReport.warnings.length})`,
    );

    for (const issue of [...adaptedReport.errors, ...adaptedReport.warnings]) {
      lines.push(
        `  - [${issue.severity}] ${issue.sceneId ? `${issue.sceneId}: ` : ""}${issue.message}`,
      );
    }
  }

  return {
    ok: errorCount === 0,
    errorCount,
    warningCount,
    checks,
    lines,
  };
}
