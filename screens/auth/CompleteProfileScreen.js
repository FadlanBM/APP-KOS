import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as z from "zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  phone_number: z.string().min(10, "Nomor telepon minimal 10 digit"),
  gender: z.enum(["male", "female"], {
    required_error: "Jenis kelamin wajib dipilih",
  }),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  emergency_contact: z.string().min(10, "Kontak darurat minimal 10 digit"),
});

export default function CompleteProfileScreen() {
  const theme = useTheme();
  const token = useAuthStore((state) => state.token);
  const setHasProfile = useAuthStore((state) => state.setHasProfile);
  const logout = useAuthStore((state) => state.logout);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const validate = (values) => {
    const result = profileSchema.safeParse(values);
    if (result.success) return {};
    const errors = {};
    result.error.issues.forEach((issue) => {
      errors[issue.path[0]] = issue.message;
    });
    return errors;
  };

  const handleSubmitProfile = async (values, { setSubmitting }) => {
    try {
      const response = await api.post("/profile", values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        Alert.alert("Berhasil", "Profil Anda telah dibuat.");
        await setHasProfile(true);
      }
    } catch (error) {
      console.error(
        "Create Profile Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.error || "Gagal membuat profil"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>
          Lengkapi Profil
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Anda belum memiliki profil. Silakan lengkapi data di bawah ini untuk
          melanjutkan.
        </Text>

        <Formik
          initialValues={{
            full_name: "",
            phone_number: "",
            gender: "male",
            date_of_birth: "",
            address: "",
            emergency_contact: "",
          }}
          validate={validate}
          onSubmit={handleSubmitProfile}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.form}>
              <TextInput
                label="Nama Lengkap"
                value={values.full_name}
                onChangeText={handleChange("full_name")}
                onBlur={handleBlur("full_name")}
                error={touched.full_name && !!errors.full_name}
                mode="outlined"
                style={styles.input}
              />
              {touched.full_name && errors.full_name && (
                <Text style={styles.errorText}>{errors.full_name}</Text>
              )}

              <TextInput
                label="Nomor Telepon"
                value={values.phone_number}
                onChangeText={handleChange("phone_number")}
                onBlur={handleBlur("phone_number")}
                error={touched.phone_number && !!errors.phone_number}
                keyboardType="phone-pad"
                mode="outlined"
                style={styles.input}
              />
              {touched.phone_number && errors.phone_number && (
                <Text style={styles.errorText}>{errors.phone_number}</Text>
              )}

              <View style={styles.radioGroup}>
                <Text variant="bodyLarge">Jenis Kelamin:</Text>
                <RadioButton.Group
                  onValueChange={(value) => setFieldValue("gender", value)}
                  value={values.gender}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="male" />
                    <Text>Laki-laki</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="female" />
                    <Text>Perempuan</Text>
                  </View>
                </RadioButton.Group>
              </View>

              <View>
                <TextInput
                  label="Tanggal Lahir"
                  value={values.date_of_birth}
                  error={touched.date_of_birth && !!errors.date_of_birth}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => setShowDatePicker(true)}
                    />
                  }
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      values.date_of_birth
                        ? new Date(values.date_of_birth)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const formattedDate = selectedDate
                          .toISOString()
                          .split("T")[0];
                        setFieldValue("date_of_birth", formattedDate);
                      }
                    }}
                  />
                )}
              </View>
              {touched.date_of_birth && errors.date_of_birth && (
                <Text style={styles.errorText}>{errors.date_of_birth}</Text>
              )}

              <TextInput
                label="Alamat"
                value={values.address}
                onChangeText={handleChange("address")}
                onBlur={handleBlur("address")}
                error={touched.address && !!errors.address}
                multiline
                numberOfLines={3}
                mode="outlined"
                style={styles.input}
              />
              {touched.address && errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}

              <TextInput
                label="Kontak Darurat"
                value={values.emergency_contact}
                onChangeText={handleChange("emergency_contact")}
                onBlur={handleBlur("emergency_contact")}
                error={touched.emergency_contact && !!errors.emergency_contact}
                keyboardType="phone-pad"
                mode="outlined"
                style={styles.input}
              />
              {touched.emergency_contact && errors.emergency_contact && (
                <Text style={styles.errorText}>{errors.emergency_contact}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitButton}
              >
                Simpan Profil
              </Button>

              <Button mode="text" onPress={logout} style={styles.logoutButton}>
                Keluar
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    marginBottom: 24,
  },
  form: {
    gap: 4,
  },
  input: {
    marginBottom: 4,
  },
  radioGroup: {
    marginVertical: 12,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 4,
  },
  logoutButton: {
    marginTop: 8,
  },
});
