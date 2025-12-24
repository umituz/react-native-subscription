/**
 * Feature List
 * List of premium features
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { FeatureItem } from "./FeatureItem";
import type { SubscriptionFeature } from "@domains/paywall/entities";

interface FeatureListProps {
    features: SubscriptionFeature[];
}

export const FeatureList: React.FC<FeatureListProps> = React.memo(({ features }) => {
    if (features.length === 0) return null;

    return (
        <View style={styles.container}>
            {features.map((feature, index) => (
                <FeatureItem key={`${feature.icon}-${index}`} icon={feature.icon} text={feature.text} />
            ))}
        </View>
    );
});

FeatureList.displayName = "FeatureList";

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
});
