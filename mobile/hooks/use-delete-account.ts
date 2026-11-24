import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { deleteMyAccount } from "@/api";
import { useDevice } from "@/context";
import { cancelNoonReminders } from "@/utils/reminders";
import { clearLocalAppData } from "@/utils/storage";

export const useDeleteAccount = () => {
	const { identity, resetInstallation } = useDevice();
	const queryClient = useQueryClient();
	const [confirmVisible, setConfirmVisible] = useState(false);

	const mutation = useMutation({
		mutationFn: async () => {
			if (!identity) {
				throw new Error("missing_identity");
			}
			await deleteMyAccount(identity);
			await cancelNoonReminders();
			await clearLocalAppData();
			await resetInstallation();
			queryClient.clear();
		},
	});

	return {
		confirmVisible,
		openConfirm: () => setConfirmVisible(true),
		closeConfirm: () => setConfirmVisible(false),
		deleteMutation: mutation,
	};
};
