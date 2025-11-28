import React from "react";
import { Phone, CheckCircle, Clock } from "lucide-react";
import { useAppSelector } from "@/store";
import {
  selectQCStats,
  selectQCStatsStatus,
} from "@/store/selectors/callsSelectors";

export function QCStatsChips() {
  const qcStats = useAppSelector(selectQCStats);
  const qcStatsStatus = useAppSelector(selectQCStatsStatus);
  const isQcStatsLoading = qcStatsStatus === 'loading';

  return (
    <div className="flex items-center gap-3 flex-nowrap ">
      {/* Total Calls Chip */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm whitespace-nowrap">
        <Phone className="h-3 w-3 text-blue-600 flex-shrink-0" />
        <span className="font-medium text-blue-900">
          Total:{" "}
          {isQcStatsLoading ? (
            <span className="inline-block w-6 h-3 bg-blue-200 animate-pulse rounded" />
          ) : (
            qcStats.total.toLocaleString()
          )}
        </span>
      </div>

      {/* Reviewed Calls Chip */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm whitespace-nowrap">
        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
        <span className="font-medium text-green-900">
          Reviewed:{" "}
          {isQcStatsLoading ? (
            <span className="inline-block w-6 h-3 bg-green-200 animate-pulse rounded" />
          ) : (
            qcStats.reviewed.toLocaleString()
          )}
        </span>
      </div>

      {/* Pending Review Chip */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm whitespace-nowrap">
        <Clock className="h-3 w-3 text-orange-600 flex-shrink-0" />
        <span className="font-medium text-orange-900">
          Pending:{" "}
          {isQcStatsLoading ? (
            <span className="inline-block w-6 h-3 bg-orange-200 animate-pulse rounded" />
          ) : (
            qcStats.pending.toLocaleString()
          )}
        </span>
      </div>
    </div>
  );
}
