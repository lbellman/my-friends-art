import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** SessionStorage key for `{ page, scrollY }` when leaving a paginated art list (see ArtCard `listRestore`). */
export function artListReturnStorageKey(namespace: string) {
  return `${namespace}-list-return`;
}

/** Restores page + scroll after back from detail. `page` is merged into the current URL (so `q` and other params stay as-is). */
export function restoreArtListPosition(
  namespace: string,
  router: AppRouterInstance,
  pathname: string,
  isLoading: boolean,
  searchParams: URLSearchParams,
) {
  if (typeof window === "undefined") return;
  const sessionStorageKey = artListReturnStorageKey(namespace);
  const raw = sessionStorage.getItem(sessionStorageKey);
  if (!raw) return;

  let parsed: { page: number; scrollY: number };
  try {
    parsed = JSON.parse(raw) as { page: number; scrollY: number };
  } catch {
    sessionStorage.removeItem(sessionStorageKey);
    return;
  }

  const { page: savedPage, scrollY } = parsed;
  if (
    typeof savedPage !== "number" ||
    savedPage < 1 ||
    typeof scrollY !== "number" ||
    Number.isNaN(scrollY)
  ) {
    sessionStorage.removeItem(sessionStorageKey);
    return;
  }

  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  if (savedPage !== currentPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(savedPage));
    router.replace(`${pathname}?${params.toString()}`);
    return;
  }

  if (isLoading) return;

  sessionStorage.removeItem(sessionStorageKey);
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
  });
}
