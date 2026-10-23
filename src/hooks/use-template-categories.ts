import { useCallback, useEffect, useRef, useState } from "react";
import { adminTemplateCategoriesApi, type TemplateCategory } from "../api/admin-template-categories.ts";
import { errorMessage } from "../api/http.ts";

type TemplateCategoriesState = {
  /** null until the first load finishes. */
  categories: TemplateCategory[] | null;
  error: string | null;
  reload: () => Promise<void>;
};

/** Super Admin: template gallery categories, in gallery order. */
export function useTemplateCategories(): TemplateCategoriesState {
  const [categories, setCategories] = useState<TemplateCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current;
    try {
      const loaded = await adminTemplateCategoriesApi.list();
      if (requestId !== latestRequest.current) return;
      setCategories(loaded);
      setError(null);
    } catch (err) {
      if (requestId === latestRequest.current) setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void reload();
    return () => {
      latestRequest.current++;
    };
  }, [reload]);

  return { categories, error, reload };
}
