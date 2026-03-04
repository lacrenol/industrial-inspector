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
    const isSecureStoreAvailable = await SecureStore.isAvailableAsync();
    const userId = isSecureStoreAvailable ? await SecureStore.getItemAsync("userId") : null;
    
    console.log("Loading surveys for real user:", userId);
    
    if (!userId) {
      console.log("No user ID found, navigating to Auth");
      navigation.replace("Auth");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/surveys?user_id=${encodeURIComponent(userId)}`);
      console.log("Surveys response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const json = await res.json();
      console.log("Real surveys data:", json);
      setSurveys(json);
    } catch (e) {
      console.warn("Failed to load surveys from backend:", e);
      // Don't set demo data - show empty state
      setSurveys([]);
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

  const handleOpenReports = () => {
    navigation.navigate("Reports");
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
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.newButton, styles.reportsButton]} onPress={handleOpenReports}>
            <Text style={styles.newButtonText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newButton} onPress={handleNewSurvey}>
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
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
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm
  },
  reportsButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
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

