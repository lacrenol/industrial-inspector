import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { RootStackParamList } from "../navigation";
import { colors, spacing, radius, typography } from "../theme";
import { BACKEND_BASE_URL } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "Surveys">;

type Survey = {
  id: string;
  name: string;
  industry_gost: string;
};

export const SurveyListScreen: React.FC<Props> = ({ navigation }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSurveys = async () => {
    setLoading(true);
    const userId = await SecureStore.getItemAsync("userId");
    if (!userId) {
      navigation.replace("Auth");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/surveys?user_id=${encodeURIComponent(userId)}`);
      const json = await res.json();
      setSurveys(json);
    } catch (e) {
      console.warn("Failed to load surveys", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadSurveys);
    return unsubscribe;
  }, [navigation]);

  const handleNewSurvey = () => {
    navigation.navigate("NewSurvey");
  };

  const handleOpenCamera = (surveyId: string) => {
    navigation.navigate("Camera", { surveyId });
  };

  const renderItem = ({ item }: { item: Survey }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenCamera(item.id)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardGost}>{item.industry_gost}</Text>
      </View>
      <Text style={styles.cardSubtitle}>Tap to capture defects</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Survey Objects</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleNewSurvey}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : surveys.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No survey objects yet.</Text>
          <Text style={styles.emptyText}>Create one to start inspection.</Text>
        </View>
      ) : (
        <FlatList
          data={surveys}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  title: {
    ...typography.title,
    color: colors.text
  },
  newButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary
  },
  newButtonText: {
    ...typography.subtitle,
    color: colors.text
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text
  },
  cardGost: {
    ...typography.body,
    color: colors.accent
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textMuted
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center"
  }
});

