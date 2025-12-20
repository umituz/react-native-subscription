/**
 * Subscription Modal Overlay Component
 * Handles the Modal wrapper and backdrop logic for different variants
 */

import React from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    ViewStyle,
} from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export type SubscriptionModalVariant = "bottom-sheet" | "fullscreen" | "dialog";

export interface ModalLayoutConfig {
    maxWidth?: number;
    maxHeightPercent?: number;
    widthPercent?: number;
    borderRadius?: number;
    backdropOpacity?: number;
    horizontalPadding?: number;
}

const DEFAULT_LAYOUT: ModalLayoutConfig = {
    maxWidth: 480,
    maxHeightPercent: 0.88,
    widthPercent: 0.92,
    borderRadius: 32,
    backdropOpacity: 0.85,
    horizontalPadding: 20,
};

interface SubscriptionModalOverlayProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    variant: SubscriptionModalVariant;
    layoutConfig?: ModalLayoutConfig;
}

export const SubscriptionModalOverlay: React.FC<SubscriptionModalOverlayProps> = ({
    visible,
    onClose,
    children,
    variant,
    layoutConfig,
}) => {
    const tokens = useAppDesignTokens();
    const config = { ...DEFAULT_LAYOUT, ...layoutConfig };


    const isFullScreen = variant === "fullscreen";

    const getFullscreenContentStyle = (): ViewStyle => ({
        width: Math.min(SCREEN_WIDTH * (config.widthPercent ?? 0.92), config.maxWidth ?? 480),
        maxHeight: SCREEN_HEIGHT * (config.maxHeightPercent ?? 0.88),
        borderRadius: config.borderRadius ?? 32,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        backgroundColor: tokens.colors.surface,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.5,
                shadowRadius: 32,
            },
            android: {
                elevation: 16,
            },
        }),
    });

    if (isFullScreen) {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={[styles.fullscreenOverlay, { paddingHorizontal: config.horizontalPadding }]}>
                    <TouchableOpacity
                        style={[
                            styles.fullscreenBackdrop,
                            { backgroundColor: `rgba(0, 0, 0, ${config.backdropOpacity ?? 0.85})` }
                        ]}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <View style={getFullscreenContentStyle()}>
                        {children}
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, variant === "dialog" && styles.overlayCentered]}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View
                    style={[
                        variant === "bottom-sheet" ? styles.bottomSheet : styles.dialog,
                        { backgroundColor: tokens.colors.surface }
                    ]}
                >
                    {children}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    overlayCentered: {
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    fullscreenOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    fullscreenBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    bottomSheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: SCREEN_HEIGHT * 0.9,
        minHeight: 400,
        width: "100%",
    },
    dialog: {
        alignSelf: "center",
        width: Math.min(SCREEN_WIDTH * 0.94, 500),
        maxHeight: SCREEN_HEIGHT * 0.85,
        borderRadius: 32,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
            },
            android: {
                elevation: 12,
            },
        }),
    },
});
