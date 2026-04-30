export const DEFAULT_SILICONFLOW_IMAGE_MODEL = "Qwen/Qwen-Image-Edit-2509";

export const SILICONFLOW_IMAGE_MODEL_OPTIONS = [
  {
    id: "Qwen/Qwen-Image-Edit-2509",
    label: "Qwen-Image-Edit-2509"
  },
  {
    id: "Qwen/Qwen-Image-Edit",
    label: "Qwen-Image-Edit"
  },
  {
    id: "Qwen/Qwen-Image",
    label: "Qwen-Image"
  },
  {
    id: "Kwai-Kolors/Kolors",
    label: "Kolors"
  }
] as const;

export type SiliconFlowImageModelId =
  (typeof SILICONFLOW_IMAGE_MODEL_OPTIONS)[number]["id"];

const supportedImageModels = new Set<string>(
  SILICONFLOW_IMAGE_MODEL_OPTIONS.map((option) => option.id)
);

export function isSupportedSiliconFlowImageModel(
  model?: string | null
): model is SiliconFlowImageModelId {
  return Boolean(model && supportedImageModels.has(model.trim()));
}

export function normalizeSiliconFlowImageModel(model?: string | null) {
  if (isSupportedSiliconFlowImageModel(model)) {
    return model.trim();
  }

  return DEFAULT_SILICONFLOW_IMAGE_MODEL;
}
