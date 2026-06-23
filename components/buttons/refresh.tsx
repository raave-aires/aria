"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DropdownMenuItem } from "../ui/dropdown-menu";

interface RefreshButtonProps {
	onRefresh: () => Promise<void>;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
	const [isPending, setIsPending] = useState(false);

	async function handleClick() {
		try {
			setIsPending(true);
			await onRefresh();
			toast.success("Previsão atualizada com sucesso!");
		} catch (_error) {
			toast.error("Erro ao atualizar", {
				description: "Tente novamente em alguns minutos.",
			});
		} finally {
			setIsPending(false);
		}
	}

	return (
		<DropdownMenuItem onClick={handleClick} disabled={isPending}>
			<RefreshCw /> Atualizar
		</DropdownMenuItem>
	);
}
