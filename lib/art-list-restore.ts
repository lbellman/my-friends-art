import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** SessionStorage key for `{ page, scrollY, tab? }` when leaving a paginated art list (see ArtCard / DashboardArtCard `listRestore`). */
export function artListReturnStorageKey(namespace: string) {
  return `${namespace}-list-return`;
}

const DASHBOARD_TAB_VALUES = new Set([
  "profile",
  "art-pieces",
  "product-requests",
]);

function parseOptionalTab(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const t = raw.trim();
  return DASHBOARD_TAB_VALUES.has(t) ? t : undefined;
}

/** Restores page + optional tab + scroll after back from detail. Params are merged into the current URL. */
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

  let parsed: { page: number; scrollY: number; tab?: unknown };
  try {
    parsed = JSON.parse(raw) as { page: number; scrollY: number; tab?: unknown };
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

  const savedTab = parseOptionalTab(parsed.tab);

  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const currentTabRaw = searchParams.get("tab");

  const params = new URLSearchParams(searchParams.toString());
  let needsReplace = false;

  if (savedPage !== currentPage) {
    params.set("page", String(savedPage));
    needsReplace = true;
  }

  if (savedTab != null && savedTab !== currentTabRaw) {
    params.set("tab", savedTab);
    needsReplace = true;
  }

  if (needsReplace) {
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    return;
  }

  if (isLoading) return;

  sessionStorage.removeItem(sessionStorageKey);
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
  });
}
