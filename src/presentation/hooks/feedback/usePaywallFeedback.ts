import { useState, useCallback } from "react";

interface UsePaywallFeedbackProps {
    onSubmit: (reason: string) => void;
    onClose: () => void;
}

export const usePaywallFeedback = ({
    onSubmit,
    onClose,
}: UsePaywallFeedbackProps) => {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [otherText, setOtherText] = useState("");

    const handleSubmit = useCallback(() => {
        if (!selectedReason) return;

        const finalReason =
            selectedReason === "other" && otherText.trim().length > 0
                ? `other: ${otherText.trim()}`
                : selectedReason;

        onSubmit(finalReason);
        setSelectedReason(null);
        setOtherText("");
        onClose();
    }, [selectedReason, otherText, onSubmit, onClose]);

    const handleSkip = useCallback(() => {
        setSelectedReason(null);
        setOtherText("");
        onClose();
    }, [onClose]);

    const selectReason = useCallback((id: string) => {
        setSelectedReason(id);
    }, []);

    return {
        selectedReason,
        otherText,
        setOtherText,
        selectReason,
        handleSubmit,
        handleSkip,
        canSubmit: !!selectedReason,
    };
};
