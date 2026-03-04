import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { colors, spacing, radius, typography } from "../theme";
import { BACKEND_BASE_URL } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "Camera">;

type Axis = "X" | "Y";
type ConstructionType = "Concrete" | "Brick" | "Metal" | "Roof";

export const CameraScreen: React.FC<Props> = ({ route }) => {
  const { surveyId } = route.params;

  const [axis, setAxis] = useState<Axis>("X");
  const [constructionType, setConstructionType] = useState<ConstructionType>("Concrete");
  const [location, setLocation] = useState("");

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ description: string; status_category: string } | null>(null);

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreviewUri(asset.uri);
        setImageBase64(asset.base64 ?? null);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromLibrary = async () => {
    try {
      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant permission to access photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreviewUri(asset.uri);
        setImageBase64(asset.base64 ?? null);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from library');
    }
  };

  const handleSend = async () => {
    if (!previewUri || !imageBase64) {
      Alert.alert("Error", "No photo captured.");
      return;
    }
    try {
      setLoading(true);

      // Call backend for analysis with embedded base64 image
      const resp = await fetch(`${BACKEND_BASE_URL}/defects/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: surveyId,
          image_base64: imageBase64,
          axis,
          construction_type: constructionType,
          location: location || null
        })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }

      const json = await resp.json();
      setAnalysis({
        description: json.description,
        status_category: json.status_category
      });
      Alert.alert("Analysis complete", `Status: ${json.status_category}`);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to send data.");
    } finally {
      setLoading(false);
    }
  };

  const axisButton = (value: Axis) => (
    <TouchableOpacity
      key={value}
      style={[styles.chip, axis === value && styles.chipActive]}
      onPress={() => setAxis(value)}
    >
      <Text style={[styles.chipText, axis === value && styles.chipTextActive]}>{value}</Text>
    </TouchableOpacity>
  );

  const constructionButton = (value: ConstructionType) => (
    <TouchableOpacity
      key={value}
      style={[styles.chip, constructionType === value && styles.chipActive]}
      onPress={() => setConstructionType(value)}
    >
      <Text
        style={[
          styles.chipText,
          constructionType === value && styles.chipTextActive
        ]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Capture parameters</Text>

        <Text style={styles.label}>Axis</Text>
        <View style={styles.row}>
          {axisButton("X")}
          {axisButton("Y")}
        </View>

        <Text style={styles.label}>Construction type</Text>
        <View style={styles.row}>
          {(["Concrete", "Brick", "Metal", "Roof"] as ConstructionType[]).map(constructionButton)}
        </View>

        <Text style={styles.label}>Location (optional)</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Axis X5–X6, level +3.600"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        {analysis && (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Gemini result</Text>
            <Text style={styles.analysisStatus}>Status category: {analysis.status_category}</Text>
            <Text style={styles.analysisText}>{analysis.description}</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              {previewUri ? "Retake Photo" : "Take Photo"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={pickFromLibrary}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              "Choose from Library"
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={loading || !previewUri}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Send to backend</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  camera: {
    flex: 1
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    margin: spacing.md
  },
  placeholderText: {
    ...typography.body,
    color: colors.textMuted
  },
  preview: {
    flex: 1,
    resizeMode: "cover"
  },
  panel: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  panelTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  } as any,
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "#20150F"
  },
  chipText: {
    ...typography.body,
    color: colors.textMuted
  },
  chipTextActive: {
    color: colors.primaryAlt
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.xs
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.text
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.textMuted
  },
  buttonDisabled: {
    opacity: 0.7
  },
  analysisCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  analysisTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs
  },
  analysisStatus: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.xs
  },
  analysisText: {
    ...typography.body,
    color: colors.textMuted
  }
});

