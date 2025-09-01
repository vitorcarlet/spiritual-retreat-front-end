import { useEffect, useMemo, useState } from "react";
import { DataTableColumn } from "../../table";
import { useQuery } from "@tanstack/react-query";
import requestServer from "@/src/lib/requestServer";
import { ReportGeneratorConfig } from "./types";

function useReportColumnBuilder(retreatId: string) {
  const { data: meta, isLoading } = useQuery<ReportGeneratorConfig>({
    queryKey: ["report-meta", retreatId],
    queryFn: () =>
      requestServer
        .get<ReportGeneratorConfig>(`/retreats/${retreatId}/report/meta`)
        .then((r) => r.data!),
  });

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (meta) {
      const defaults = [
        ...meta.baseColumns
          .filter((c) => c.defaultVisible || c.fixed)
          .map((c) => c.key),
      ];
      setSelectedKeys(defaults);
    }
  }, [meta]);

  const toggle = (k: string) =>
    setSelectedKeys((keys) =>
      keys.includes(k)
        ? keys.filter(
            (x) =>
              x !== k && !meta?.baseColumns.find((b) => b.key === k && b.fixed)
          )
        : [...keys, k]
    );

  const columns = useMemo<DataTableColumn<any>[]>(() => {
    if (!meta) return [];
    return meta.baseColumns
      .concat(
        meta.customFields
          .filter((f) => selectedKeys.includes(f.key))
          .map((f) => ({ key: f.key, label: f.label }))
      )
      .filter((c) => selectedKeys.includes(c.key) || c.fixed)
      .map((c) => ({
        field: c.key,
        headerName: c.label,
        flex: 1,
        minWidth: 140,
      }));
  }, [meta, selectedKeys]);

  return { meta, isLoading, selectedKeys, toggle, columns };
}
