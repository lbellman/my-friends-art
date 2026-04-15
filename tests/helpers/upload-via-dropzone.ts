import { expect, type Page } from "@playwright/test";

/** Matches `UploadImageStep` print-quality `FileUploader` */
export const SUBMIT_PRINT_QUALITY_DROPZONE_TEST_ID =
  "submit-print-quality-dropzone" as const;
/** Matches `UploadImageStep` display images `FileUploader` */
export const SUBMIT_DISPLAY_IMAGES_DROPZONE_TEST_ID =
  "submit-display-images-dropzone" as const;
/** Matches `EditDisplayImagesDialog` `FileUploader` */
export const EDIT_DISPLAY_IMAGES_DROPZONE_TEST_ID =
  "edit-display-images-dropzone" as const;
/** `UploadImageStep` — uncheck so the separate display dropzone is shown (print flow). */
export const USE_PRINT_AS_DISPLAY_CHECKBOX_TEST_ID =
  "use-print-as-display-image" as const;

export type UploadViaDropzoneOptions = {
  /**
   * Must match `dropzoneTestId` on `FileUploader` → `data-testid` on the
   * `FileDropzone` root (e.g. `submit-print-quality-dropzone`).
   */
  dataTestId: string;
  /**
   * Paths on disk for `setInputFiles` (absolute or relative to `process.cwd()`).
   */
  files: string | readonly string[];
};

/**
 * Uploads into a react-dropzone-backed `FileDropzone` by targeting the hidden
 * `input[type="file"]` under the wrapper with `data-testid={dataTestId}`.
 *
 * Fails fast if that dropzone is not in the DOM (e.g. print flow with “use print
 * as display” still checked — there is no separate display uploader until you
 * uncheck `USE_PRINT_AS_DISPLAY_CHECKBOX_TEST_ID`).
 */
export async function uploadFilesViaDropzone(
  page: Page,
  { dataTestId, files }: UploadViaDropzoneOptions,
): Promise<void> {
  const paths = typeof files === "string" ? [files] : [...files];
  const root = page.getByTestId(dataTestId);
  await expect(root).toBeVisible({ timeout: 15_000 });
  await root.locator('input[type="file"]').setInputFiles(paths);
}
