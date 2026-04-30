import { SettingsShell } from "@/components/settings/settings-shell";
import {
  DEFAULT_SILICONFLOW_IMAGE_MODEL,
  normalizeSiliconFlowImageModel
} from "@/lib/content/siliconflow-image-models";
import type {
  PlatformId,
  PlatformImageModelSelections,
  PlatformSkillSelections,
  SkillLearningResultRecord
} from "@/lib/content-creation-types";
import { migrateDatabase } from "@/lib/db/migrate";
import { getPlatformSetting } from "@/lib/db/repositories/platform-settings-repository";
import {
  getSkillLearningResult,
  listSkills
} from "@/lib/db/repositories/skill-repository";
import { ensureBuiltinImageSkills } from "@/lib/skills/builtin-image-skills";

const platformIds: PlatformId[] = [
  "wechat",
  "xiaohongshu",
  "twitter",
  "videoScript"
];

export default function SettingsPage() {
  migrateDatabase();
  ensureBuiltinImageSkills();

  const skills = listSkills();
  const initialSkillDetails = skills.reduce<
    Record<string, SkillLearningResultRecord | null>
  >((result, skill) => {
    result[skill.id] = getSkillLearningResult(skill.id);
    return result;
  }, {});
  const initialPlatformSelections = platformIds.reduce<PlatformSkillSelections>(
    (result, platformId) => {
      const savedSetting = getPlatformSetting(platformId) as
        | {
            enabled_skill_ids_json?: string;
          }
        | null;

      result[platformId] = savedSetting?.enabled_skill_ids_json
        ? (JSON.parse(savedSetting.enabled_skill_ids_json) as string[])
        : [];

      return result;
    },
    {
      wechat: [],
      xiaohongshu: [],
      twitter: [],
      videoScript: []
    }
  );
  const initialImageSkillSelections = platformIds.reduce<PlatformSkillSelections>(
    (result, platformId) => {
      const savedSetting = getPlatformSetting(platformId) as
        | {
            image_skill_ids_json?: string;
          }
        | null;

      result[platformId] = savedSetting?.image_skill_ids_json
        ? (JSON.parse(savedSetting.image_skill_ids_json) as string[])
        : [];

      return result;
    },
    {
      wechat: [],
      xiaohongshu: [],
      twitter: [],
      videoScript: []
    }
  );
  const initialImageModelSelections = platformIds.reduce<PlatformImageModelSelections>(
    (result, platformId) => {
      const savedSetting = getPlatformSetting(platformId) as
        | {
            image_model?: string;
          }
        | null;

      result[platformId] = normalizeSiliconFlowImageModel(
        savedSetting?.image_model ?? DEFAULT_SILICONFLOW_IMAGE_MODEL
      );

      return result;
    },
    {
      wechat: DEFAULT_SILICONFLOW_IMAGE_MODEL,
      xiaohongshu: DEFAULT_SILICONFLOW_IMAGE_MODEL,
      twitter: DEFAULT_SILICONFLOW_IMAGE_MODEL,
      videoScript: DEFAULT_SILICONFLOW_IMAGE_MODEL
    }
  );

  return (
    <SettingsShell
      initialImageModelSelections={initialImageModelSelections}
      initialImageSkillSelections={initialImageSkillSelections}
      initialPlatformSelections={initialPlatformSelections}
      initialSkillDetails={initialSkillDetails}
      initialSkills={skills}
    />
  );
}
