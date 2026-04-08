import { useEffect } from "react";
import { createConsumer } from "@rails/actioncable";
import { addToast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

// Connects to the Rails ActionCable StatusSyncChannel and listens for
// the broadcast that fires when all statuses have finished scraping.
// Calls onDone when the broadcast arrives so the caller can stop the loading state.
export function useStatusSync(onDone: () => void) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const cable = createConsumer("ws://localhost:4000/cable");

        const subscription = cable.subscriptions.create("StatusSyncChannel", {
            received(data: { isUpdated?: boolean; error?: string }) {
                onDone();

                if (data.error) {
                    addToast({
                        title:       "Sync failed",
                        description: data.error,
                        timeout:     4000,
                        shouldShowTimeoutProgress: true,
                        variant:     "solid",
                        color:       "danger",
                    });
                    return;
                }

                addToast({
                    title:       "Sync complete",
                    description: data.isUpdated ? "Statuses were updated!" : "No changes found.",
                    timeout:     3000,
                    shouldShowTimeoutProgress: true,
                    variant:     "solid",
                    color:       "success",
                });

                queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            },
        });

        return () => subscription.unsubscribe();
    }, [queryClient]);
}
